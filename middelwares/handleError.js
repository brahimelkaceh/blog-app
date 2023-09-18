//! Middleware to handle registration form input validation errors
exports.handleError = (req, res, next) => {
  const { username, email, password } = req.body;
  const filename = req.file?.filename || "";

  const errors = [];

  //! Check for validation errors and add them to the errors array
  if (!username) errors.push("Username is required.");
  if (!email) errors.push("Email is required.");
  if (!filename) errors.push("Image upload is required.");
  if (!password || password.length < 9) {
    errors.push("Password should be at least 9 characters long.");
  }

  //! If there are validation errors, render the registration form with error messages
  if (errors.length > 0) {
    return res.render("register", { errors });
  }

  // ! If there are no validation errors, proceed to the next middleware or route handler
  next();
};
