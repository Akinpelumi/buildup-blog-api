import db from "../config/db/index.js";
import queries from "../queries/queries.auth.js";

export const checkUserExistsByEmail = async (email) => {
    const user = await db.oneOrNone(queries.checkUserExistsByEmail, [ email.trim().toLowerCase() ]);
    return user;
}

export const checkUserExistsByUsername = async (username) => {
    const user = await db.oneOrNone(queries.checkUserExistsByUsername, [ username.trim().toLowerCase() ]);
    return user;
}

export const createUser = async (body, hash, verificationCode, verificationCodeExpireAt) => {
    const user = await db.oneOrNone(queries.createUser, [
        body.email.trim().toLowerCase(),
        body.username.trim().toLowerCase(),
        hash,
        body.first_name.trim().toLowerCase(),
        body.last_name ? body.last_name.trim().toLowerCase() : null,
        verificationCode,
        verificationCodeExpireAt
    ]);
    return user;
}

export const checkIfUserActivelyExistsByEmail = async (email) => {
    const user = await db.oneOrNone(queries.checkIfUserActivelyExistsByEmail, [ email.trim().toLowerCase() ]);
    return user;
}

export const updateUserVerification = async (email) => {
    const verifiedUser = await db.oneOrNone(queries.updateUserAccountVerification, [ email.trim().toLowerCase() ]);
    return verifiedUser; 
}

export const updateUserVerificationCode = async (email, verificationCode, verificationCodeExpireAt) => {
    const updatedUser = await db.oneOrNone(queries.updateUserVerificationCode, [ email.trim().toLowerCase(), verificationCode, verificationCodeExpireAt ]);
    return updatedUser;
}

export const checkIfUserActivelyExistsByEmailAndUsername = async (username) => {
    const user = await db.oneOrNone(queries.checkIfUserActivelyExistsByEmailAndUsername, [ username.trim().toLowerCase() ]);
    return user;
}

export const userPassword = async (user_id) => {
    const userPasswordDetails = await db.oneOrNone(queries.userPassword, [ user_id ]);
    return userPasswordDetails;
}

export const updateUserOnLogin = async (user_id) => {
    const user = await db.oneOrNone(queries.updateUserOnLogin, [ user_id ]);
    return user;
}

export const checkIfUserActivelyExistsByUserId = async (user_id) => {
    const user = await db.oneOrNone(queries.checkIfUserActivelyExistsByUserId, [ user_id ]);
    return user;
}

export const deleteUnusedOtps = async () => {
    const result = await db.result(queries.deleteUnusedOtps, []);
    return result;
}

export const newlySignedUpBlogUsers = async () => {
    const result = await db.any(queries.newlySignedUpBlogUsers, []);
    return result;
}
