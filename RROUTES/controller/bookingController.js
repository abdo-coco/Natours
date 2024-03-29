const AppError = require("../../utils/AppError.js");
const Tour = require("./../../model/tourmodel.js");
const Booking = require("./../../model/bookingmodel.js");
const catchAsync = require("./../../RROUTES/controller/catchAsync.js");
const factory = require("./../controller/handlerFactory.js");
require("dotenv").config({ path: "../../config.env" });
// console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")(
  "sk_test_51OP4VoDCnw9REc2PBXBfrtnO9A2cHY7baG0EBWaTUEno6RRNAdK2grf6ALYaaDiGUxgUwdMz49WvJAs4LHE3yW5200P8M7J5HN"
);
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100, // Amount in cents, adjust if necessary
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });
  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split("?")[0]);
});
exports.getAllBooking = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
