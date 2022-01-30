module.exports = class extends require("@endpoint/controller") {
  // Set a custom header for this spesific endpoint
  // The header property should be an object
  $headers = {
    "X-Powered-By": "custom_header_value",
  };
  // Accessible path for this controller
  // This is the path of your endpoint
  $path = "/user/add/:userName";
  // Set the endpoint method
  $method = "POST";
  // Middleware
  // This function will get called before the controller
  $middleware = (params, callback) => {
    return callback(true);
  };
  // Your main controller
  async $(args) {
    args.controller.response.json({
      status: true,
    });
  }
};
