module.exports = {
  path: __dirname,
  port: 8081,
  prefix: {
    middleware: "middleware_",
    controller: "controller_",
    model: "model_",
  },
  headers: {
    "X-Powered-By": "openrapid-js",
  },
  debugger: {
    log: {
      save: false,
    },
  },
};
