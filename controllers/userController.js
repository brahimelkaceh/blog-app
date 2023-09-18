const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

// ! Render the registration form
exports.renderRegister = (req, res) => {
  const errors = [];
  res.render("register", { errors });
};

// ! Render the login form
exports.renderLogin = (req, res) => {
  const errors = [];
  res.render("login", { errors });
};

// ! Handle user registration
exports.handleRegistration = async (req, res) => {
  const { username, email, password } = req.body;
  let filename = "";
  if (req.file) {
    filename = req.file.filename;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuid.v4();

  const user = {
    username,
    email,
    password: hashedPassword,
    filename,
    id: userId,
  };

  try {
    await axios.post("http://localhost:5000/users", user);
    res.redirect("/login");
  } catch (error) {
    res.status(500).send("Registration failed");
  }
};

// ! Handle user login
exports.handleLogin = async (req, res) => {
  const { username, password } = req.body;
  const errors = [];
  try {
    const userResponse = await axios.get(
      `http://localhost:5000/users?username=${username}`
    );

    const user = userResponse.data[0];

    if (!user) {
      errors.push("Login failed. Invalid credentials.");
      return res.render("login", { errors });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          image: user.filename,
        },
        "your_secret_key_here",
        {
          expiresIn: "10h",
        }
      );

      res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });

      res.redirect("/dashboard");
    } else {
      errors.push("Login failed. Invalid credentials.");
      return res.render("login", { errors });
    }

    if (errors.length > 0) {
      res.status(401).send(errors.join("\n"));
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed");
  }
};

// ! Controller for the dashboard
exports.dashboardController = async (req, res) => {
  const errors = [];
  try {
    const usersResponse = await axios.get("http://localhost:5000/Users");
    const usersCount = usersResponse.data;
    const allBlogsResponse = await axios.get("http://localhost:5000/Blogs");
    const allBlogsCount = allBlogsResponse.data;
    const blogsData = allBlogsResponse.data;

    const blogsByAuthor = blogsData.filter(
      (blog) => blog.user.blogAuthorId === req.userId
    );

    res.render("dashboard", {
      email: req.email,
      image: req.image,
      username: req.username,
      userId: req.userId,
      usersCount: usersCount.length,
      allBlogsCount: allBlogsCount.length,
      blogsByAuthor: blogsByAuthor.length,
      errors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data for the dashboard");
  }
};

// ! Handle user logout
exports.handleLogout = (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
};

// ! Middleware to fetch user data
exports.fetchUserData = async (req, res, next) => {
  try {
    const response = await axios.get("http://localhost:5000/Users");
    const users = response.data;
    req.userImage = users.map((user) => user.filename);
    req.username = users.map((user) => user.username);
    req.userId = users.map((user) => user.id);

    next();
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Error occurred while fetching user data");
  }
};
