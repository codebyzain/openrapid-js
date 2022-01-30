module.exports = class extends require("@endpoint/controller") {
  // Accessible pa  th for this controller
  // This is the path of your endpoint
  $path = "/user/upload";
  // The midst
  $method = "POST";
  // Your main controller
  async $(args) {
    const upload = await args.controller.storage.file.save({
      image: {
        destination: "/images",
        rename: "new_name",
      },
    });
    // Getting the full path of the image
    console.log(args.controller.storage.file.getFullPath(upload.files.image));
    // Getting the full URL of the image
    console.log(args.controller.storage.file.getFullURL(upload.files.image));
    // Displayig the uploaded image
    args.controller.storage.file.display(upload.files.image);
  }
};
