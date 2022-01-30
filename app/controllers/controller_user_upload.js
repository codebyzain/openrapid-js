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
        rename: "jancuk",
      },
      file_2: {
        destination: "/images",
        rename: "jancuk",
      },
    });
    console.log(upload);
    console.log(args.controller.storage.file.getFullPath(upload.files.image));
    console.log(args.controller.storage.file.getFullURL(upload.files.image));
    args.controller.storage.file.display(upload.files.image);
  }
};
