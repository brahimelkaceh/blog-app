const jwt = require("jsonwebtoken");

// ! Middleware to log in and authenticate users using JWT
exports.logger = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key_here");

    const { email, image, username, userId } = decoded;

    req.email = email;
    req.image = image;
    req.username = username;
    req.userId = userId;

    // ! Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    // ! Redirect to the login page in case of token verification failure
    res.redirect("/login");
  }
};
