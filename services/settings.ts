import sql from "../configs/mysql";

export const updateProfile = (req, res, next) => {
  try {
    const { id } = req.user;
    sql.query("select * from stocks where user_id = ?", id, (err, data) => {
      if (err) {
        console.log("error: ", err);
      } else {
        return res.json({ data });
      }
    });
  } catch (err) {
    next(err);
  }
};
