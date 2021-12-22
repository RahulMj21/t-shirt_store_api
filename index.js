require("dotenv").config();
const app = require("./app");
const dbConnect = require("./config/dbConnect");

// mongodb connection
dbConnect();

app.listen(process.env.PORT, () =>
  console.log(`server is running on PORT ${process.env.PORT}`)
);
