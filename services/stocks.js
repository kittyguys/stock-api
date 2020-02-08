import bluebird from "bluebird";
import redis from "redis";
import Stock from "../models/stocks";
import { connection, pool } from "../configs/mysql";

bluebird.promisifyAll(redis);

export const getStocks = async (req, res, next) => {
  try {
    const conn = await connection;
    const { id } = req.user;
    const rows = await conn
      .query(
        "SELECT id,content,created_at FROM stocks WHERE user_id = ? ORDER BY stock_order DESC LIMIT 10",
        id
      )
      .then(data => {
        return data[0];
      })
      .catch(e => {
        throw e;
      });
    const stocks = rows.map(item => {
      return { ...item, id: "" + item.id };
    });
    res.json({ stocks });
  } catch (err) {
    next(err);
  }
};

export const createStock = async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const { id } = req.user;
    const { content } = req.body;
    const query = {
      user_id: id,
      content
    };
    const stock = {
      id: null,
      content: query.content,
      created_at: "now"
    };
    const rows = await connection
      .query("INSERT INTO stocks SET ?", query)
      .then(data => {
        return data[0];
      })
      .catch(err => {
        throw err;
      });
    await connection
      .query("UPDATE stocks SET stock_order = ? WHERE id = ?", [
        rows.insertId,
        rows.insertId
      ])
      .then(data => {
        return data[0];
      })
      .catch(err => {
        throw err;
      });

    await connection.commit();
    stock.id = "" + rows.insertId;
    return res.json({ stock });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

export const deleteStock = async (req, res, next) => {
  try {
    const { stockId } = req.body;
    const conn = await connection;
    await conn
      .query("DELETE FROM stocks WHERE id = ?", stockId)
      .then(data => {
        return data[0];
      })
      .catch(err => {
        next(err);
      });

    return res.json({ stockId });
  } catch (err) {
    next(err);
  }
};

export const reorderStock = async (req, res, next) => {
  try {
    const conn = await connection;
    const client = await redis.createClient(6379, process.env.REDIS_HOST);
    const { id } = req.user;
    const { stocks } = req.body;
    const temp = stocks.map((item, i) => {
      return [i, item];
    });
    const values = temp.flat();
    values.unshift("uid" + id);

    client.zadd(values, function(err, response) {
      if (err) throw err;
    });

    var args1 = ["uid" + id, 0, -1];
    const result = await client.zrangeAsync(args1).then(value => {
      return value;
    });

    for (let i = 0; i < result.length; i++) {
      await conn
        .query("UPDATE stocks SET stock_order = ? WHERE id = ?", [i, result[i]])
        .then(data => {
          return data[0];
        })
        .catch(err => {
          throw err;
        });
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

// not using now

export const addStock = async (req, res, next) => {
  const { id } = req.user;
  const { content } = req.body;
  Stock.findOneAndUpdate({ user_id: id }, { $push: { content } }, function(
    err
  ) {
    if (err) return next(err);
    res.json({ stock: { id: generateID(), content } });
  });
};

const generateID = () => {
  return (
    "_" +
    Math.random()
      .toString(36)
      .substr(2, 12)
  );
};
