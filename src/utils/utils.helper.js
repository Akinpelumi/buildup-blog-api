import Crypto from "crypto";
import jwt from "jsonwebtoken";

export const generateVerificationCode = (length) => {
    const code = Crypto.randomInt(0, 1000000).toString().padStart(parseInt(length), '7');
    return code;
}

export const generateJWTToken = (userExists) => {
    const token = jwt.sign({ user_id: userExists.user_id, email: userExists.email }, process.env.JWT_SECRET, { expiresIn: '10mins' })
    return token;
}

export const decodeJWTToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}