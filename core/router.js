const fs = require("fs");
const global = require("@/global");
const path = require("path");
const dbConfig = require("@config/database");
const database = require("@core/database");
const log = require("@config/log");

function $fpath($path, file) {
  if ($path === undefined) {
    const fileName = file
      .replace(".js", "")
      .replace(global.prefix.controller !== undefined ? global.prefix.controller : "", "");
    return "/" + fileName.split("_").join("/");
  }
  return $path;
}
function $setHeader(h, res) {
  if (typeof global.headers !== "undefined" && typeof global.headers == "object") {
    Object.keys(global.headers).forEach((i) => {
      res.setHeader(i, global.headers[i]);
    });
  }
  if (h !== undefined && typeof h == "object") {
    Object.keys(h).forEach((i) => {
      res.setHeader(i, h[i]);
    });
  }
}
asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
module.exports = async (router) => {
  // Scan controller directory and look for controller file
  fs.readdir(global.path + "/app/controllers", function (err, files) {
    // Loop available files in the controller directory
    files.map((file) => {
      // Only load controller with .js extension
      if (file !== ".DS_Store" && path.extname(file) == ".js") {
        const $endpoint = require(global.path + "/app/controllers/" + file);
        // Check if endpoint follows the rule of controller (class function)
        if (typeof $endpoint == "function") {
          // Define the controller class as a class instance
          // which contains all of the properties of the controller
          const $class = new $endpoint();
          Array.isArray($class.$path) == true
            ? log("Endpoint Registered : " + $class.$path.join(", ").green + " (".gray + file.gray + ")".gray, "yellow")
            : log(
                "Endpoint Registered : " + $fpath($class.$path, file).green + " (".gray + file.gray + ")".gray,
                "yellow"
              );
          // Class Method, default to GET
          // The router will try to find $method property in the controller class
          const $class_method = $class.$method !== undefined ? $class.$method : "GET";
          // Run the class controller
          router[$class_method.toLowerCase()]($fpath($class.$path, file), async (req, res, next) => {
            // Passed parameters
            $parameters = {
              next: next,
              log: log,
              database: database,
              middleware: {
                data: {},
              },
              model: {},
              controller: new $endpoint(req, res, this.middleware),
            };
            // Middleware status
            $middleware_total_count =
              $class.$middleware !== undefined && Array.isArray($class.$middleware) ? $class.$middleware.length : 0;
            $middleware_count = 0;
            // Check for models
            if ($class.$model !== undefined) {
              if (Array.isArray($class.$model) && $class.$middleware.length > 0) {
                var assignedModels = {};
                await asyncForEach($class.$model, (item) => {
                  try {
                    const $model_path = global.path + "/app/models/" + global.prefix.model + item;
                    const $model = require($model_path);
                    const $call_model = new $model($parameters);
                    Object.assign(assignedModels, {
                      [item]: $call_model,
                    });
                  } catch (e) {
                    log(e.message, "red");
                  }
                });
                $parameters.model = assignedModels;
              } else if (typeof $class.$model === "string") {
                try {
                  const $model_path = global.path + "/app/models/" + global.prefix.model + $class.$model;
                  const $model = require($model_path);
                  const $call_model = new $model($parameters);
                  $parameters.model = { ...$parameters.model, ...$call_model };
                } catch (e) {
                  log(e.message, "red");
                }
              }
            }
            // Check if endpoint has middleware
            if ($class.$middleware !== undefined) {
              if (Array.isArray($class.$middleware) && $class.$middleware.length > 0) {
                await asyncForEach($class.$middleware, async (item) => {
                  try {
                    const $middleware_path = global.path + "/app/middlewares/" + global.prefix.middleware + item;
                    const $middleware = require($middleware_path);
                    await $middleware($parameters, (status, data) => {
                      if (status == true) {
                        $middleware_count += 1;
                      }
                      if (typeof data !== "undefined") {
                        $parameters.middleware.data = { ...$parameters.middleware.data, ...data };
                      }
                    });
                  } catch (e) {
                    log(e.message, "red");
                  }
                });
              } else if (typeof $class.$middleware == "function") {
                $middleware_count = 0;
                $middleware_total_count = 1;
                $class.$middleware($parameters, (status, data) => {
                  if (status == true) {
                    $middleware_count += 1;
                  } else {
                    // Set controller header if exist and middleware failed
                    $setHeader($class.$headers, res);
                  }
                  if (data !== undefined) {
                    Object.assign($parameters.middleware.data, data);
                  }
                });
              }
            }

            // Wait until there is no middleware proccess ongoing
            if ($middleware_total_count == $middleware_count) {
              const $controller = $class.$ || $class.$run || $class.$controller;
              if (typeof $controller !== "undefined") {
                // Set controller header if exist
                $setHeader($class.$headers, res);
                // Run the controller method
                $controller($parameters);
              } else {
                log(`Can't find method $, $run or $controller in ${file} make sure to add one of the method`, "red");
              }
            } else {
              // Set controller header if exist and middleware failed
              $setHeader($class.$headers, res);
            }
          });
          // End
        } else {
          // Error
          log("Controller should be a class file", "red");
        }
      }
    });
  });
};
