import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../configs/mysql";

export const signup = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        throw err;
      }
      const { user_name, email } = req.body;
      const query = {
        ...req.body,
        display_name: req.body.user_name,
        password: hash
      };
      const rows = await connection
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
      const token = jwt.sign(user, process.env.JWT_SECRET_KEY);
      return res.json({ token });
    });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const password = req.body.password;
    const signinID = req.body.signinID;
    const rows = await connection
      .query("SELECT * FROM users WHERE user_name = ? LIMIT 1", [signinID])
      .then(data => {
        return data[0][0];
      })
      .catch(err => {
        next(err);
      });
    if (rows.length === 0) {
      return res.json({ error: "ユーザーが存在しません" });
    }
    bcrypt.compare(password, rows.password, (err, result) => {
      if (err) {
        throw err;
      }
      if (result) {
        const user = {
          id: rows.id,
          user_name: rows.user_name,
          display_name: rows.display_name,
          email: rows.email,
          profile_image_url: rows.profile_image_url
        };
        const token = jwt.sign(user, process.env.JWT_SECRET_KEY);
        return res.json({ token });
      } else {
        return res.json({ error: "パスワードが間違ってるぞコラ" }); // TODO
      }
    });
  } catch (err) {
    next(err);
  }
};
