class HomeController {
  home = (req, res) => {
    res.status(200).json({
      message: "Welcome to our t-shirt shops api and this is a dummy route",
    });
  };
}

module.exports = new HomeController();
