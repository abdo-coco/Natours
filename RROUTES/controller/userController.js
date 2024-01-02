const AppError = require("../../utils/AppError.js");
const User = require("./../../model/usermodel.js");
const catchAsync = require("./../../RROUTES/controller/catchAsync.js");
const factory = require("./../controller/handlerFactory.js");
const multer = require("multer");
const sharp = require("sharp");
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Not an Image. Please upload only image", 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.uploadUserImage = upload.single("photo");
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. please use /updateMyPassword",
        400
      )
    );
  }
  const filterObject = filterObj(req.body, "name", "email");
  if (req.file) filterObject.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.user.id, filterObject, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.checkID = (req, res, next, val) => {
  console.log(`ID TOUT is ${val}`);
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      statue: "failed",
      messsage: "No tour found",
    });
  }
  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    statue: "error",
    messsage: "This Data is not available",
  });
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     statue: "success",
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });
