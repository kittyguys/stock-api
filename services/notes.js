import pool from "../configs/mysql";
import redis from "redis";

export const getNotes = async (req, res, next) => {
  try {
    const connection = await pool;
    const { id } = req.user;
    const rows = await connection
      .query(
        "SELECT id,title,created_at FROM notes WHERE user_id=? ORDER BY updated_at DESC",
        id
      )
      .then(data => {
        return data[0];
      })
      .catch(err => {
        next(err);
      });
    const notes = rows.map(item => {
      return { ...item, id: "" + item.id };
    });
    return res.json({ notes });
  } catch (err) {
    next(err);
  }
};

export const getNote = async (req, res, next) => {
  try {
    const connection = await pool;
    const { note_id } = req.params;
    const stocks = await connection
      .query(
        "SELECT stocks.id,stocks.content,stocks.created_at,stocks.updated_at " +
          "FROM stocks " +
          "JOIN notes_stocks ON notes_stocks.stock_id = stocks.id " +
          "AND notes_stocks.note_id = ? " +
          "ORDER BY notes_stocks.stock_order",
        [note_id]
      )
      .then(data => {
        return data[0];
      })
      .catch(err => {
        next(err);
      });
    return res.json({ id: note_id, stocks });
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const connection = await pool;
    const { id } = req.user;
    const { title } = req.body;
    const query = {
      user_id: id,
      title
    };
    const note = {
      id: null,
      title
    };
    const rows = await connection
      .query("INSERT INTO notes SET ?", query)
      .then(data => {
        return data[0];
      })
      .catch(err => {
        throw err;
      });
    note.id = "" + rows.insertId;
    return res.json({ note });
  } catch (err) {
    next(err);
  }
};

export const addStock = async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const { note_id } = req.params;
    const { stock_id } = req.body;
    const query = {
      note_id,
      stock_id
    };
    const rows = await connection
      .query("INSERT INTO notes_stocks SET ?", query)
      .then(data => {
        return data[0];
      })
      .catch(err => {
        throw err;
      });
    await connection
      .query("UPDATE notes_stocks SET stock_order = ? WHERE stock_id = ?", [
        rows.insertId,
        stock_id
      ])
      .then(data => {
        return data[0];
      })
      .catch(err => {
        throw err;
      });
    const stock = await connection
      .query(
        "SELECT id,content,created_at,updated_at FROM stocks WHERE id = ?",
        [stock_id]
      )
      .then(data => {
        return data[0];
      })
      .catch(err => {
        throw err;
      });
    await connection.commit();
    return res.json({ stock });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

export const renameNote = async (req, res, next) => {
  try {
    const connection = await pool;
    const { note_id } = req.params;
    const { title } = req.body;
    const columns = {
      title
    };
    await connection
      .query("UPDATE notes SET ? where id = ?", [columns, note_id])
      .catch(err => {
        next(err);
      });
    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

export const reorderStocks = async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const client = await redis.createClient(6379, process.env.REDIS_HOST);
    const { id } = req.user;
    const { note_id } = req.params;
    const { stocks } = req.body;
    const temp = stocks.map((item, i) => {
      return [i, item];
    });
    const values = temp.flat();
    const key = "uid" + id + "notes" + note_id;
    values.unshift(key);

    client.zadd(values, function(err, response) {
      if (err) throw err;
    });

    const q = [key, 0, -1];
    const result = await client.zrangeAsync(q).then(value => {
      return value;
    });

    for (let i = 0; i < result.length; i++) {
      await connection
        .query("UPDATE notes_stocks SET stock_order = ? WHERE stock_id = ?", [
          i,
          result[i]
        ])
        .catch(err => {
          throw err;
        });
    }
    const reorderedStocks = await connection
      .query(
        "SELECT stocks.id,stocks.content,stocks.created_at,stocks.updated_at " +
          "FROM stocks " +
          "JOIN notes_stocks ON notes_stocks.stock_id = stocks.id " +
          "AND notes_stocks.note_id = ? " +
          "ORDER BY notes_stocks.stock_order",
        [note_id]
      )
      .then(data => {
        return data[0];
      })
      .catch(err => {
        next(err);
      });
    return res.json({ stocks: reorderedStocks });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};
