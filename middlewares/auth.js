import createError from "http-errors";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const rawToken = req.headers["authorization"];
    if (!rawToken) throw createError(401, "Access denied. No token provided.");

    const token = rawToken.split(" ")[1];
    if (!token) throw createError(401, "Invalid token.");

    const userData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = userData;
    next();
  } catch (err) {
    next(err);
  }
};
