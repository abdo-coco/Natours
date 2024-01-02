const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });
const Tour = require("./model/tourmodel");
const User = require("./model/usermodel");
const Review = require("./model/reviewModel");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DataBasePassword
);

const tours = JSON.parse(
  fs.readFileSync("starter/dev-data/data/tours.json", "utf8")
);
const users = JSON.parse(
  fs.readFileSync("starter/dev-data/data/users.json", "utf8")
);
const reviews = JSON.parse(
  fs.readFileSync("starter/dev-data/data/reviews.json", "utf8")
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

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data succefully loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data succefully Removed!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
console.log(process.argv);
if (process.argv[2] === "--import") importData();
else if (process.argv[2] === "--delete") deleteData();
