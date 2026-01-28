import * as authModel from '../models/models.auth.js';
import * as Hash from '../utils/utils.hash.js';
import * as Helpers from '../utils/utils.helper.js';
import sendEmail from '../services/email/services.email.js';
import { registerMail } from '../utils/templates/email/register.js';
import { welcomeMail } from '../utils/templates/email/welcome.js';

export const register = async (req, res) => {
    const { email, password, username, first_name, last_name } = req.body
    if (!email || !username || !password || !first_name) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'email, username, password and first_name are required'
        })
    }

    if (!email.includes('@')) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'email is invalid'
        })
    }
    
    if (password.length < 10) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'password length should not be less than 10'
        })
    }

    if (!/[A-Z]/g.test(password) || !/[a-z]/g.test(password) || !/[0-9]/g.test(password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/g.test(password)) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'password should contain at least one uppercase, lowercase, number and special character'
        })
    }

    if (username.length < 3 || first_name.length < 3 || last_name.length < 3) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'username, first_name and last_name should not be less than 3 characters'
        })
    }

    const existingEmail = await authModel.checkUserExistsByEmail(email);
    if (existingEmail) {
        return res.status(409).json({
            status: 'error',
            code: 409,
            message: 'email already exists'
        })
    }
    const existingUserName = await authModel.checkUserExistsByUsername(username);
    if (existingUserName) {
        return res.status(409).json({
            status: 'error',
            code: 409,
            message: 'username already exists'
        })
    }

    // hash password
    const hash = await Hash.hashData(password);

    // generate unique identifier/otp
    const verificationCode = Helpers.generateVerificationCode(6);
    const verificationCodeDuration = 10; // in minutes
    const verificationCodeExpireAt = new Date(Date.now() + verificationCodeDuration * 60 * 1000);

    // save to the DB
    const newUser = await authModel.createUser(req.body, hash, verificationCode, verificationCodeExpireAt);

    // send verification email to users
    const data = {
        first_name,
        otp: verificationCode,
        otp_duration: verificationCodeDuration
    }
    const emailContent = registerMail(data);
    await sendEmail(email, 'Verify Account', emailContent);

    return res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Account created successfully',
        data: newUser
    })
};

export const verifyAccount = async (req, res) => {
    const { verification_code, email } = req.body;

    if (!verification_code || !email) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'verification_code and email are required'
        })
    }

    if (verification_code.length !== 6) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'verification_code must be 6 digits'
        })
    }

    const userDetails = await authModel.checkIfUserActivelyExistsByEmail(email);
    if (!userDetails) {
        return res.status(401).json({
            status: 'error',
             code: 401,
             message: 'Invalid email, user does not exist'
        })
    }

    if (userDetails.is_verified_account) {
        return res.status(400).json({
            status: 'error',
             code: 400,
             message: 'Account already verified'
        })
    }

    if (userDetails.verification_code_expire_at < new Date()) {
        return res.status(401).json({
            status: 'error',
             code: 401,
             message: 'Verification code has expired'
        })
    }

    if (verification_code !== userDetails.verification_code) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'Invalid verification code'
        })
    }

    const verifiedUser = await authModel.updateUserVerification(email);

    // send welcome email to users
    const data = { first_name: userDetails.first_name }
    const emailContent = welcomeMail(data);
    await sendEmail(email, 'Welcome to BuildUp Blogs', emailContent);

    return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Account verified successfully',
        data: verifiedUser
    })
};

export const resendVerificationCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'email is required'
        })
    }

    const userDetails = await authModel.checkIfUserActivelyExistsByEmail(email);
    if (!userDetails) {
        return res.status(401).json({
            status: 'error',
             code: 401,
             message: 'Invalid email, user does not exist'
        })
    }

    if (userDetails.is_verified_account) {
        return res.status(400).json({
            status: 'error',
             code: 400,
             message: 'Account already verified'
        })
    }

   // generate unique identifier/otp
    const verificationCode = Helpers.generateVerificationCode(6);
    const verificationCodeDuration = 10; // in minutes
    const verificationCodeExpireAt = new Date(Date.now() + verificationCodeDuration * 60 * 1000);

    const updatedUser = await authModel.updateUserVerificationCode(email, verificationCode, verificationCodeExpireAt);

    // send email of new otp verification code
    const data = {
        first_name: userDetails.fir,
        otp: verificationCode,
        otp_duration: verificationCodeDuration
    }
    const emailContent = registerMail(data);
    await sendEmail(email, 'Verify Account', emailContent);

    if (process.env.NODE_ENV !== 'test') {
        delete updatedUser.verification_code;
    }

    return res.status(200).json({
        status: 'success',
         code: 200,
         message: 'Verification code resent successfully',
         data: updatedUser
    })
};

export const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(422).json({
            status: 'error',
            code: 422,
            message: 'username and password are required'
        })
    }

    const userExists = await authModel.checkIfUserActivelyExistsByEmailAndUsername(username);
    if (!userExists) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'Invalid login credentials'
        })
    }

    const userPasswordDetails = await authModel.userPassword(userExists.user_id);
    const validPassword = await Hash.compareData(password, userPasswordDetails.password);
    if (!validPassword) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'Invalid login credentials'
        })
    }

    const allowedStatuses = [ 'active', 'inactive' ]
    if (!allowedStatuses.includes(userExists.status)) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: `User account is ${userExists.status}, kindly contact support team`
        })
    }

    // generate jwt token to manage sessions
    const token = Helpers.generateJWTToken(userExists);
    await authModel.updateUserOnLogin(userExists.user_id);

    return res.status(200).json({
        status: 'success',
         code: 200,
         message: 'User logged in successfully',
         data: { ...userExists, token }
    })
};



