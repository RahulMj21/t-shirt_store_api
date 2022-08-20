require("dotenv").config();
const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const fileupload = require("express-fileupload");
const morgan = require("morgan");
const cloudinary = require("cloudinary");
const { errorHandler } = require("./middlewares");

// import routes
const { homeRoute, userRoute, productRoute } = require("./routes");

// using swagger
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);
app.use(cookieparser());

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(morgan("tiny"));
// routes middlewares
app.use(homeRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", productRoute);

app.use(errorHandler);
module.exports = app;
