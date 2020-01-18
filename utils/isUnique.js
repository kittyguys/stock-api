import pool from "../configs/mysql";

export const isUserNameUnique = async userName => {
  const connection = await pool;
  const result = await connection
    .query("SELECT * FROM users WHERE user_name = ? LIMIT 1", [userName])
    .then(data => {
      return data[0].length;
    })
    .catch(err => {
      console.log(err);
    });
  const isUnique = result ? false : true;
  return isUnique;
};
