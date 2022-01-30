module.exports = class extends require("@endpoint/controller") {
  $method = "POST";
  $path = "/user/delete/:id";
  async $(args) {
    args.controller.response.json({
      deleted: true,
    });
  }
};
