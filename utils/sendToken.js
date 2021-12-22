const { Token } = require("../models");

const sendToken = async (user, res) => {
  const token = user.generateJwtToken();
  res.cookie("token", token, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    httpOnly: true,
  });

  const dbToken = await Token.exists({ userId: user._id });
  const tokenData = {
    userId: user._id,
    token,
  };
  if (dbToken) {
    await Token.findOneAndUpdate({ userId: user._id }, tokenData);
  } else {
    await Token.create(tokenData);
  }

  user.password = undefined;
  res.status(200).json({ success: true, user, token });
};

module.exports = sendToken;
