const mongoose = require("mongoose");
require("dotenv").config();

//define mongodb url
console.log("correct");
// const mongoURL = process.env.MONGODB_URL;
const mongoURL = process.env.MONGODB_URL_LOCAL;
//setup mongoose connection
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log("connected to mongo server");
});
db.on("disconnected", () => {
  console.log("disconnected to mongo server");
});
db.on("error", (err) => {
  console.log("error found", err);
});

module.exports = db;
