const AppError = require("../../utils/AppError.js");
const Tour = require("./../../model/tourmodel.js");
const APIFeatures = require("./../../utils/apiFeatures.js");
const catchAsync = require("./../../RROUTES/controller/catchAsync.js");
const factory = require("./../controller/handlerFactory.js");
const multer = require("multer");
const sharp = require("sharp");
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      statue: "failed",
      messsage: "Please enter a name and  price",
    });
  }
  next();
};

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Not an Image. Please upload only image", 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourPhoto = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover && !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "ratingsAverage,price,difficulty,summary,name";
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        numRatings: { $sum: "$ratingsQuantity" },
      },
    },
  ]);
  res.status(200).json({
    statue: "success",
    data: {
      stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.query.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          // $lt: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);

  res.status(200).json({
    statue: "success",
    data: {
      num: plan.length,
      plan,
    },
  });
});
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getToursWithin = catchAsync(async (req, res, next) => {
  //"tours-within/:distance/center/:latlng/unit/:unit"
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        "please provide latitude and longitude in the format lat, lng"
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    statue: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const multipler = unit === "mi" ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        "please provide latitude and longitude in the format lat, lng"
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multipler,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    statue: "success",

    data: {
      data: distances,
    },
  });
});
//exports.getAllTours = catchAsync(async function (req, res, next) {
// const queryObject = { ...req.query };
// const excludedFields = ["page", "limit", "sort", "fields"];
// excludedFields.forEach((el) => {
//   delete queryObject[el];
// });

// let queryStr = JSON.stringify(queryObject);
// queryStr = queryStr.replace(
//   /\b(gt|gte|lt|lte|in)\b/g,
//   (match) => `$${match}`
// );
// queryStr = JSON.parse(queryStr);

// let query = Tour.find(queryStr);
////// sort query
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(",").join(" ");
//   query = query.sort(sortBy);
// } else {
//   query = query.sort("-createdAt");
// }

/////// fields query
// if (req.query.fields) {
//   const fields = req.query.fields.split(",").join(" ");
//   query = query.select(fields);
// } else {
//   query = query.select("-__v");
// }
///////// page and limit

// const limit = req.query.limit * 1 || 100;
// const page = req.query.page * 1 || 1;
// const skip = (page - 1) * limit;
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numDocument = await Tour.countDocuments();
//   if (skip >= numDocument) {
//     throw new Error("This page is not available");
//   }
// }
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .limitFields()
//     .sort()
//     .paginate();
//   const tours = await features.query;
//   res.status(200).json({
//     statue: "success",
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// exports.getTour = catchAsync(async function (req, res, next) {
//   const tour = await Tour.findById(req.params.id).populate("reviews");
//   console.log(tour);

//   if (!tour) return next(new AppError("Tour with that ID not found"));
//   res.status(200).json({
//     statue: "success",
//     data: {
//       tour,
//     },
//   });
// });

// exports.createTour = catchAsync(async function (req, res, next) {
//   const newTour = await Tour.create(req.body);
//   res.status(200).json({
//     statue: "success",
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) return next(new AppError("Tour with that ID not found"));

//   res.status(200).json({
//     statue: "success",
//     data: {
//       tour,
//     },
//   });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) return next(new AppError("Tour with that ID not found"));

//   res.status(204).json({
//     statue: "success",
//     data: null,
//   });
// });

// const tours = JSON.parse(
//   fs.readFileSync(`starter/dev-data/data/tours-simple.json`)
// );
// exports.checkID = (req, res, next, val) => {
//   console.log(`ID TOUT is ${val}`);
//   if (+req.params.id > tours.length) {
//     return res.status(404).json({
//       statue: "failed",
//       messsage: "No tour found",
//     });
//   }
//   next();
// };
