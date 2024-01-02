const catchAsync = require("./../../RROUTES/controller/catchAsync.js");
const Review = require("./../../model/reviewModel.js");
const factory = require("./../controller/handlerFactory.js");

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const Reviews = await Review.find(filter);
//   res.status(200).json({
//     status: "success",
//     results: Reviews.length,
//     data: {
//       Reviews,
//     },
//   });
// });
