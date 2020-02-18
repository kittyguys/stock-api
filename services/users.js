import promise from "mysql2/promise";
import jwt from "jsonwebtoken";
import { isUserNameUnique } from "../utils/isUnique";
import { connectionData } from "../configs/mysql";
import { s3 } from "../configs/aws";

export const getUsers = async (req, res, next) => {
  try {
    return res.json({ status: "ok" });
  } catch (error) {
    return null;
  }
};

export const checkUserName = async (req, res, next) => {
  try {
    const { user_name } = req.body;
    const isUnique = await isUserNameUnique(user_name);
    return res.json({ isUnique });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const conn = await promise.createConnection(connectionData);
    const { id } = req.user;
    const query = req.body;
    const files = req.files;

    const uploadFile = (file, filename) => {
      const params = {
        Bucket: "stock-s4",
        Key: filename,
        Body: file,
        ACL: "public-read"
      };

      s3.upload(params, async (err, data) => {
        if (err) {
          throw err;
        }
        const columns = {
          ...query,
          profile_image_url: data.Location
        };
        await conn
          .query("UPDATE users SET ? where id = ?", [columns, id])
          .then(data => {
            return data[0];
          })
          .catch(err => {
            next(err);
          });
        const rows = await conn
          .query("SELECT * FROM users WHERE id = ? LIMIT 1", [id])
          .then(data => {
            return data[0][0];
          })
          .catch(err => {
            next(err);
          });
        const user = {
          id: rows.id,
          user_name: rows.user_name,
          display_name: rows.display_name,
          email: rows.email,
          profile_image_url: rows.profile_image_url
        };
        const token = jwt.sign(user, process.env.JWT_SECRET_KEY);
        return res.json({ token });
      });
    };

    if (files) {
      uploadFile(files.profile_image_url.data, files.profile_image_url.name);
    } else {
      if (Object.entries(query).length > 0) {
        await conn
          .query("UPDATE users SET ? where id = ?", [query, id])
          .then(data => {
            return data[0];
          })
          .catch(err => {
            next(err);
          });
        const rows = await conn
          .query("SELECT * FROM users WHERE id = ? LIMIT 1", [id])
          .then(data => {
            return data[0][0];
          })
          .catch(err => {
            next(err);
          });
        const user = {
          id: rows.id,
          user_name: rows.user_name,
          display_name: rows.display_name,
          email: rows.email,
          profile_image_url: rows.profile_image_url
        };
        const token = jwt.sign(user, process.env.JWT_SECRET_KEY);
        return res.json({ token });
      }

      throw new Error("empty object"); // TODO
    }
  } catch (err) {
    next(err.message);
  }
};

// TODO
const createBucket = () => {
  const params = {
    Bucket: "stock-s4",
    CreateBucketConfiguration: {
      // Set your region here
      LocationConstraint: "ap-northeast-1"
    }
  };

  s3.createBucket(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else console.log("Bucket Created Successfully", data.Location);
  });
};
