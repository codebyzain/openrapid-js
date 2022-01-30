module.exports = class extends require("@controller") {
  // Accessible pa  th for this controller
  // This is the path of your endpoint
  $path = ["/user/list/", "/user/list/:page"];
  // Middlewares
  $middleware = ["auth", "auth_two"];

  // Models
  $model = ["example", "product"];
  // Your main controller
  async $(args) {
    args.controller.response.json({
      status: true,
    });
  }
};
