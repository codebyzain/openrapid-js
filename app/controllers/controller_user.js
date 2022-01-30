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
    var filtered = [];
    // const data = await args.database
    //   .table("user")
    //   .select()
    //   .execute(async (data) => {
    //     await args.database.table("user").delete().where({
    //       id: data.id,
    //     });
    //   });

    console.log();

    args.controller.response.json({
      status: true,
      data: await args.database.table("user").row({ id: 281 }).select(),
    });
  }
};
