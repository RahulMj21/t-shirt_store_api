const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", (error) => {
    console.log("connection error..", error);
    process.exit(1);
  });
  db.once("open", () => console.log("db connected.."));
};

module.exports = dbConnect;
