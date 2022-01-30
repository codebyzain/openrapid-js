module.exports = class extends require("@endpoint/controller") {
  // Accessible pa  th for this controller
  // This is the path of your endpoint
  $path = "/image/download/:filename";
  // The midst
  $method = "GET";
  // Your main controller
  async $(args) {
    console.log(args.controller.storage.file.download("images/" + args.request.params.filename));
  }
};
