process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION ERROR");
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DataBasePassword
);

mongoose
  .connect(DB, {
    useCreateIndex: true,
    useFindAndModifyIndex: false,
    useNewUrlParser: true,
  })
  .then((con) => {
    //console.log(con);
    console.log("connection succeful");
  });

const server = app.listen(3000, () => {
  console.log(`app running on port 3000`);
});
console.log(app.get("env"));
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTATION ERROR: ");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
