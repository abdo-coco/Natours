const Tour = require("./../../model/tourmodel.js");
const catchAsync = require("./../../RROUTES/controller/catchAsync.js");
const AppError = require("./../../utils/AppError.js");
const Booking = require("./../../model/bookingmodel.js");

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "This is Tour Overview",
    tours,
  });
});
// exports.getOverview = (req, res) => {
//   res.status(200).render("overview", {
//     title: "This is Tour Overview",
//   });
// };

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: " review rating user",
  });
  if (!tour) {
    return next(new AppError("There is no Tour with that name."));
  }

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});
exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};
exports.getSignupForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Create your account",
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: " Your Account",
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  const booking = await Booking.find({ user: req.user.id });
  const tourIDs = booking.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.render("overview", {
    title: "My Tours",
    tours,
  });
});

// Mustafa
// Mustafa Ahmed
// const getOverview = catchAsync(async (req, res, next )=>{

//   const headerContent = "default-src 'self' https://cdnjs.cloudflare.com/ajax/* ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com  'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"

//   //1)  get Tour Data from the collection

//     const tours = await Tour.find();

//   //2) build template and then render using tour data from step 1
//     res.status(200).setHeader('Content-Security-Policy', headerContent).render('overview', {
//       title: 'All Tours',
//       tours
//     } )
//   })
