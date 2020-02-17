import promise from "mysql2/promise";
import { connectionData } from "../configs/mysql";

export const isUserNameUnique = async userName => {
  const conn = await promise.createConnection(connectionData);
  const result = await conn
    .query("SELECT * FROM users WHERE user_name = ? LIMIT 1", [userName])
    .then(data => {
      return data[0].length;
    })
    .catch(err => {
      throw err;
    });
  const isUnique = result ? false : true;
  return isUnique;
};
