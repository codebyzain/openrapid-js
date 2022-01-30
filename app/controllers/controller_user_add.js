module.exports = class extends require("@endpoint/controller") {
  // Set a custom header for this spesific endpoint
  // The header property should be an object
  $headers = {
    "X-Powered-By": "zaincode",
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
    if (await args.controller.validate.require.header(["x-access-token"])) {
      const insert = await args.database.query(`INSERT INTO user VALUES(null, '${args.request.params.userName}', 0)`);
      args.response.json({
        status: true,
        data: insert,
      });
    } else {
      args.response.json({
        status: false,
      });
    }
  }
};
