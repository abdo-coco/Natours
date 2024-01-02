const mongoose = require("mongoose");
const slugify = require("slugify");
//const User = require("./usermodel");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tout must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "Tout must have less or equal than 40 characters"],
      minlength: [10, "Tout must have more or equal than 10 characters"],
    },
    slug: {
      type: String,
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tout must have a max group"],
    },
    difficulty: {
      type: String,
      required: [true, "Tout must have a difficulty"],
      enum: {
        values: ["easy", "difficult", "medium"],
        message: "Difficulty must be : easy or difficult or medium",
      },
    },

    secrtTour: {
      type: Boolean,
      default: false,
    },

    duration: {
      type: Number,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Ratings Average must be above 1.0"],
      max: [5, "Ratings Average must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      required: [true, "Tout must have a Price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount must be below price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Tout must have a Summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "Tout must have a Image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "Review",
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.pre("save", function (next) {
  //this.sulg = slugify(this.name, { lower: true });
  this.slug = slugify(this.name, { lower: true });

  next();
});
// Embedded way
// tourSchema.pre("save", async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });
// tourSchema.pre("/^find/", function (next) {
//   this.find({ secrtTour: { $ne: true } });
//   console.log(this);
//   next();
// });
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v",
  });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.find({ secrtTour: { $ne: true } });
  next();
});

// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secrtTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
