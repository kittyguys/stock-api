import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const rawToken = req.headers["authorization"];
  const token = rawToken.split(" ")[1];
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token.");
  }
};
