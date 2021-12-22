class CustomErrorHandler extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }

  static unauthorized(message = "Unauthorized user") {
    return new CustomErrorHandler(message, 401);
  }
}

module.exports = CustomErrorHandler;
