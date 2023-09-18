const express = require("express");
const app = express();
const cookies = require("cookie-parser");
const PORT = 7000;

const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static("public", { maxAge: 86000 }));
app.use(cookies());
app.set("view engine", "ejs");

app.use("/", userRoutes);
app.use("/dashboard", blogRoutes);

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
