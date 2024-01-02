const catchAsync = require("./../../RROUTES/controller/catchAsync.js");
const AppError = require("../../utils/AppError.js");
const APIFeatures = require("./../../utils/apiFeatures.js");
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError("Document with that ID not found"));

    res.status(204).json({
      statue: "success",
      data: null,
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError("Document with that ID not found"));

    res.status(200).json({
      statue: "success",
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async function (req, res, next) {
    const doc = await Model.create(req.body);
    res.status(200).json({
      statue: "success",
      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Model, populateOptions) =>
  catchAsync(async function (req, res, next) {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) return next(new AppError("Document with that ID not found"));
    res.status(200).json({
      statue: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async function (req, res, next) {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .sort()
      .paginate();
    const docs = await features.query;
    res.status(200).json({
      statue: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
