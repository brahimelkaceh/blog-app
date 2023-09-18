const imageInput = document.getElementById("imageInput");
const selectedImage = document.getElementById("selectedImage");

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    // Create a URL for the selected file
    const imageUrl = URL.createObjectURL(file);
    selectedImage.src = imageUrl;
  } else {
    // Clear the image source if no file is selected
    selectedImage.src = "";
  }
});
