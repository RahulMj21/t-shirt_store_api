const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { customErrorHandler, BigPromise } = require("../utils");

exports.checkAuth = BigPromise(async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    const [prefix, headerToken] = req.headers.authorization.split(" ");
    token = headerToken;
  } else if (req.body.token) {
    token = req.body.token;
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) return next(customErrorHandler.unauthorized());
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  if (!id) return next(customErrorHandler.unauthorized());
  const user = await User.findById(id);
  if (!user) return next(customErrorHandler.unauthorized());
  req.user = user;
  next();
});
exports.checkUserRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new customErrorHandler("you are not authorized to use this route", 403)
      );
    next();
  };
};
