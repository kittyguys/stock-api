import logger from "../utils/logger";

export const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500);
  res.send({ errorMessage: err.message });
};

export const logErrors = (err, req, res, next) => {
  logger.error(err.message);
  next(err);
};
