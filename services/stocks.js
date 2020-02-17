import promise from "mysql2/promise";
import bluebird from "bluebird";
import redis from "redis";
import Stock from "../models/stocks";
import { connectionData } from "../configs/mysql";

bluebird.promisifyAll(redis);

export const getStocks = async (req, res, next) => {
  try {
    const conn = await promise.createConnection(connectionData);
    const { id } = req.user;
    const rows = await conn
      .query(
        "SELECT id,content,created_at,updated_at FROM stocks WHERE user_id = ? ORDER BY stock_order DESC LIMIT 50",
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
  try {
    const conn = await promise.createConnection(connectionData);
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
    const rows = await conn
      .query("INSERT INTO stocks SET ?", query)
      .then(data => {
        return data[0];
      })
      .catch(err => {
        throw err;
      });
    await conn
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
    stock.id = "" + rows.insertId;
    return res.json({ stock });
  } catch (err) {
    next(err);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { stockId, content } = req.body;
    const conn = await promise.createConnection(connectionData);
    const columns = {
      content
    };
    await conn
      .query("UPDATE stocks SET ? where id = ?", [columns, stockId])
      .then(data => {
        return data[0];
      })
      .catch(err => {
        next(err);
      });
    const rows = await conn
      .query(
        "SELECT id,content,created_at,updated_at FROM stocks WHERE id = ? LIMIT 1",
        [stockId]
      )
      .then(data => {
        return data[0][0];
      })
      .catch(err => {
        next(err);
      });
    return res.json({ stock: rows });
  } catch (err) {
    next(err);
  }
};

export const deleteStock = async (req, res, next) => {
  try {
    const { stockId } = req.body;
    const conn = await promise.createConnection(connectionData);
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
    const conn = await promise.createConnection(connectionData);
    const host = process.env.REDIS_HOST ? process.env.REDIS_HOST : "localhost";
    const client = await redis.createClient(6379, host);
    const { id } = req.user;
    const { stocks } = req.body;
    const temp = stocks.map((item, i) => {
      return [i, item];
    });
    const values = temp.flat();
    const key = "uid" + id;
    values.unshift(key);

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

    client.del(key);

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
