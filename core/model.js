class Model {
  constructor(req) {
    this.controller = {
      request: req.controller,
    };
    this.database = req.database;
  }
}
module.exports = Model;
