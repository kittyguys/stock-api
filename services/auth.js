import promise from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { isUserNameUnique } from "../utils/isUnique";
import { connectionData } from "../configs/mysql";

export const signup = async (req, res, next) => {
  try {
    const { user_name, email, password } = req.body;
    const isUnique = await isUserNameUnique(user_name);
    if (!isUnique) throw createError(500, "こちらのidはご利用いただけません。");

    const conn = await promise.createConnection(connectionData);
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) throw err;
      const query = {
        ...req.body,
        display_name: req.body.user_name,
        password: hash
      };
      const rows = await conn
        .query("INSERT INTO users SET ?", query)
        .then(data => {
          return data[0];
        })
        .catch(err => {
          if (err) throw err;
        });
      const user = {
        id: rows.insertId,
        user_name: user_name,
        display_name: user_name,
        email: email,
        profile_image_url: null
      };
      const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
        expiresIn: "90 days"
      });
      return res.json({ token });
    });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const conn = await promise.createConnection(connectionData);
    const password = req.body.password;
    const signinID = req.body.signinID;
    const rows = await conn
      .query("SELECT * FROM users WHERE user_name = ? LIMIT 1", [signinID])
      .then(data => {
        return data[0];
      })
      .catch(err => {
        next(err);
      });
    if (rows.length === 0)
      throw createError(404, "id、またはパスワードが間違っています。");
    const userData = rows[0];
    bcrypt.compare(password, userData.password, (err, result) => {
      try {
        if (err) throw err;
        if (!result)
          throw createError(401, "id、またはパスワードが間違っています。");
        const user = {
          id: userData.id,
          user_name: userData.user_name,
          display_name: userData.display_name,
          email: userData.email,
          profile_image_url: userData.profile_image_url
        };
        const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
          expiresIn: "90 days"
        });
        return res.json({ token });
      } catch (err) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};
