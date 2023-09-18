const axios = require("axios");
const moment = require("moment");

// ! Function to create a new blog post
exports.createBlog = async (req, res) => {
  try {
    const filename = req.file?.filename || "";
    const currentDateTime = moment();

    // Validation: Check if the blog title is empty
    const errors = [];
    if (!req.body.title) {
      errors.push("Blog title is required.");
    }
    if (!req.body.content || req.body.content.length < 25) {
      errors.push("Blog content should be at least 25 characters long.");
    }
    if (!filename) errors.push("Blog Image upload is required.");

    if (errors.length > 0) {
      // Render the dashboard with errors
      return res.render("dashboard", {
        email: req.email,
        image: req.image,
        username: req.username,
        userId: req.userId,
        errors, // Pass the errors array to the template
      });
    }

    // Create the blog object
    const blog = {
      blogTitle: req.body.title,
      blogContent: req.body.content,
      blogImage: filename,
      timeCreated: currentDateTime.format("YYYY-MM-DD HH:mm"),
      user: {
        blogAuthor: req.username,
        blogAuthorId: req.userId,
        authorImage: req.image,
      },
    };

    // Make a POST request to your API to create the blog
    await axios.post("http://localhost:5000/blogs", blog);

    // Log success and redirect
    console.log("Data created successfully");
    res.redirect("/dashboard/allBlogs");
  } catch (error) {
    console.error("Error creating blog:", error);

    // Handle errors and render an error page or display a message as needed
    res.status(500).send("Adding blog failed");
  }
};

// ! Function to retrieve all blog posts
exports.getAllBlogs = async (req, res) => {
  console.log(req);
  const errors = [];
  try {
    // Make a GET request to your API to fetch all blogs
    const response = await axios.get("http://localhost:5000/blogs");
    const blogs = response.data;
    res.render("allBlogs", {
      blogs,
      image: req.image,
      username: req.username,
      userId: req.userId,
      errors,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
};

// ! Function to retrieve a single blog post
exports.getBlog = async (req, res) => {
  try {
    const blogId = req.params.id.replace(":", "");

    // Make a GET request to your API to fetch a specific blog by ID
    const response = await axios.get(`http://localhost:5000/blogs/${blogId}`);
    const blog = response.data;

    res.render("singleBlog", {
      blog,
      image: req.image,
      username: req.username,
      userId: req.userId,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
};

// ! Function to delete a blog post
exports.deleteBlog = async (req, res) => {
  const blogIdToDelete = parseInt(req.params.id.replace(":", ""));

  try {
    // Make a GET request to your API to check if the blog exists
    const response = await axios.get(
      `http://localhost:5000/blogs/${blogIdToDelete}`
    );

    if (response.status === 200) {
      const loggedInUserId = req.userId;
      if (loggedInUserId === response.data.user.blogAuthorId) {
        // Make a DELETE request to your API to delete the blog
        const deleteResponse = await axios.delete(
          `http://localhost:5000/blogs/${blogIdToDelete}`
        );

        if (deleteResponse.status === 200) {
          console.log(deleteResponse.data);
          console.log("blog deleted successfully");
          res.redirect("/dashboard/allBlogs");
        } else {
          res.status(deleteResponse.status).send(deleteResponse.data);
        }
      } else {
        res
          .status(403)
          .send("Forbidden: You are not authorized to delete this blog post.");
      }
    } else {
      res.status(response.status).send(response.data);
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// ! Function to view the edit page for a blog post
exports.viewEditPage = async (req, res) => {
  const errors = [];
  try {
    const blogIdToEdit = parseInt(req.params.id);

    // Make a GET request to your API to fetch a specific blog by ID for editing
    const response = await axios.get(
      `http://localhost:5000/blogs/${blogIdToEdit}`
    );
    const blog = response.data;

    res.render("editBlog", {
      blog,
      image: req.image,
      username: req.username,
      userId: req.userId,
      errors,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
};

// ! Function to edit a blog post
exports.editBlog = async (req, res) => {
  const blogIdToEdit = parseInt(req.params.id.replace(":", ""));

  try {
    const response = await axios.get(
      `http://localhost:5000/blogs/${blogIdToEdit}`
    );

    if (response.status === 200) {
      const loggedInUserId = req.userId;

      if (loggedInUserId === response.data.user.blogAuthorId) {
        const currentDateTime = moment();
        const updatedFields = {};

        // Validation: Check if the blog title is empty
        const errors = [];
        if (!req.body.title) {
          errors.push("Blog title is required.");
        }

        if (errors.length > 0) {
          // Render the edit form with errors
          const blogData = await axios.get(
            `http://localhost:5000/blogs/${blogIdToEdit}`
          );

          return res.render(`editBlog`, {
            email: req.email,
            image: req.image,
            username: req.username,
            userId: req.userId,
            blogData: blogData.data, // Pass the existing blog data to the template
            errors, // Pass the errors array to the template
          });
        }

        // If title is provided, update the title
        if (req.body.title) {
          updatedFields.blogTitle = req.body.title;
        }

        // If content is provided, update the content
        if (req.body.content) {
          updatedFields.blogContent = req.body.content;
        }

        // If a file is provided, update the image
        if (req.file) {
          updatedFields.blogImage = req.file.filename;
        }

        updatedFields.timeCreated = currentDateTime.format("YYYY-MM-DD HH:mm");
        updatedFields.user = {
          blogAuthor: req.username,
          blogAuthorId: req.userId,
          authorImage: req.image,
        };

        // Make a PATCH request to your API to edit the blog
        const editResponse = await axios.patch(
          `http://localhost:5000/blogs/${blogIdToEdit}`,
          updatedFields
        );

        if (editResponse.status === 200) {
          console.log("Blog edited successfully");
          res.redirect("/dashboard/allBlogs"); // Redirect to the desired URL after successful edit
        } else {
          res.status(editResponse.status).send(editResponse.data);
        }
      } else {
        res
          .status(403)
          .send("Forbidden: You are not authorized to edit this blog post.");
      }
    } else {
      res.status(response.status).send(response.data);
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
