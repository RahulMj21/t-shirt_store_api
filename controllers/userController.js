const {
  BigPromise,
  customErrorHandler,
  sendToken,
  sendMail,
} = require("../utils");
const { User, Token } = require("../models");
const cloudinary = require("cloudinary");
const CustomErrorHandler = require("../utils/CustomErrorHandler");
const crypto = require("crypto");

class UserController {
  register = BigPromise(async (req, res, next) => {
    const { name, password, email } = req.body;

    // check all the fields
    if (!(name && password && email)) {
      return next(new customErrorHandler("All fields are required", 400));
    }
    let user;
    // if user sends avatar img then do this
    if (req.files || req.body.avatar) {
      let result;
      const avatar = req.files.avatar ? req.files.avatar : req.body.avatar;
      result = await cloudinary.v2.uploader.upload(
        typeof avatar === "object" ? avatar.tempFilePath : avatar,
        {
          folder: "/tshirtstore/users",
          width: 200,
          crop: "scale",
        }
      );

      if (result) {
        // create the user
        user = await User.create({
          name,
          password,
          email,
          avatar: {
            public_id: result.public_id,
            secure_url: result.secure_url,
          },
        });
      }
    } else {
      user = await User.create({
        name,
        password,
        email,
      });
    }

    // generate token and send response
    sendToken(user, res);
  });
  login = BigPromise(async (req, res, next) => {
    const { email, password } = req.body;
    if (!(email && password)) {
      console.log(req.body);
      return next(new customErrorHandler("all fields are required", 400));
    }

    // check the user exists or not
    const user = await User.findOne({ email });
    if (!user)
      return next(new customErrorHandler("Wrong email or password", 400));

    // check the password matches or not
    const matches = await user.comparePassword(password);
    if (!matches)
      return next(new customErrorHandler("Wrong email or password", 400));
    // generate token and send response
    sendToken(user, res);
  });
  getUserDetails = BigPromise(async (req, res, next) => {
    const user = req.user;
    user.password = undefined;

    res.status(200).json({
      success: true,
      user,
    });
  });
  logout = BigPromise(async (req, res, next) => {
    const user = req.user;
    const token = await Token.findOne({ userId: user._id });
    if (!token) return next(customErrorHandler.unauthorized());
    token.remove();
    res
      .status(200)
      .clearCookie("token")
      .json({ message: "logged out successfully" });
  });
  forgotPassword = BigPromise(async (req, res, next) => {
    const { email } = req.body;
    if (!email)
      return next(new customErrorHandler("please enter your email", 400));

    const user = await User.findOne({ email });
    if (!user) return next(new customErrorHandler("email not registered", 400));

    const forgotPasswordToken = user.getForgotPasswordToken();
    user.save({ validateBeforeSave: false });

    const data = {
      to: email,
      subject: "Reset Your Password",
      html: `<p>click the given link to reset your password <br>
      <a> ${req.protocol}://${req.get(
        "host"
      )}/api/v1/password/reset/${forgotPasswordToken} </a> </p>`,
    };

    await sendMail(data);

    res.status(200).json({
      success: true,
      message: "password reset link sent to your email",
    });
  });
  resetPassword = BigPromise(async (req, res, next) => {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;
    if (!token) return next(new customErrorHandler("invalid request", 400));
    if (!newPassword || !confirmNewPassword)
      return next(new CustomErrorHandler("All fields are required", 400));
    if (newPassword !== confirmNewPassword)
      return next(
        new CustomErrorHandler(
          "confirm password mismatched with the new password",
          400
        )
      );

    const forgotPasswordToken = crypto
      .createHmac("sha256", process.env.FORGOT_TOKEN_SECRET)
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) return next(new CustomErrorHandler("invalid request", 400));

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    user.save();

    await sendToken(user, res);
  });
  updatePassword = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!(currentPassword && newPassword && confirmNewPassword))
      return next(new customErrorHandler("All fields are required", 400));

    const match = await user.comparePassword(currentPassword);
    if (!match)
      return next(
        new customErrorHandler("current password dosen't matches", 400)
      );

    if (newPassword !== confirmNewPassword)
      return next(
        new customErrorHandler(
          "confirmNewPassword field dosen't matches with the newPassword field",
          400
        )
      );

    user.password = newPassword;
    user.save();
    res.status(200).json({
      success: true,
      message: "password updated",
    });
  });
  updateUserProfile = BigPromise(async (req, res, next) => {
    if (!req.body)
      return next(new customErrorHandler("please enter updatable value", 400));
    let result;
    if (req.files || req.body.avatar) {
      const avatar = req.files.avatar ? req.files.avatar : req.body.avatar;
      result = await cloudinary.v2.uploader.upload(
        typeof avatar === "object" ? avatar.tempFilePath : avatar,
        {
          folder: "/tshirtstore/users",
          width: 200,
          crop: "scale",
        }
      );
      if (result)
        req.body.avatar = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  });

  adminAllUsers = BigPromise(async (req, res, next) => {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  });

  adminSingleUsers = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(new customErrorHandler("user not found", 404));

    res.status(200).json({
      success: true,
      user,
    });
  });

  managerAllUsers = BigPromise(async (req, res, next) => {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  });

  updateUserRole = BigPromise(async (req, res, next) => {
    const { role } = req.body;
    const { id } = req.params;
    if (!role) return next(new customErrorHandler("invalid request", 400));
    const user = await User.findById(id);
    if (!user) return next(new customErrorHandler("user not found", 404));

    user.role = role;
    user.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "user role updated",
    });
  });

  deleteUser = BigPromise(async (req, res, next) => {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return next(new customErrorHandler("user not found", 404));

    res.status(200).json({
      success: true,
      message: "user deleted",
    });
  });
}

module.exports = new UserController();
