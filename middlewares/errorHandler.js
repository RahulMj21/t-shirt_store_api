const { customErrorHandler } = require("../utils");

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = err.message ? err.message : "internal server error";

  if (err instanceof customErrorHandler) {
    statusCode = err.statusCode;
    message = err.message;
  }
  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
