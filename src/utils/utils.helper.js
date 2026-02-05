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

export const paginationOffsetLimit = (query) => {
  const offset = query.page ? (query.page - 1) * (query.per_page || 5) : 0;
  const limit = query.per_page ? query.per_page : 5;
  return { offset, limit };
}

export const paginationTotalPages = (totalCount, limit) => {
  // display page divides the total blogs by the per_page(limit) and rounds it up or down to the nearest integer(whole number)
  const displayPage = Math.floor(totalCount / limit);

  // total pages => if total blogs divided by per page has a remainder, add one to display page, else use the value of display page
  const totalPages = totalCount % limit ? displayPage + 1 : displayPage;

  return totalPages;
}