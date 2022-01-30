// openrapid-js-v4
// Created by Royan Zain
// Since October 17, 2022
// And here we go...

// And Oh, Normaly you wouldn't have to edit any of these code below
require("module-alias/register");
require("@config/log");
require("colors");
require("path");
var express = require("express"),
  app = express(),
  global = require("@/global"),
  bodyParser = require("body-parser"),
  bodyParserConfig = require("@config/body_parser"),
  router = express.Router(),
  multer = require("multer"),
  upload = multer(),
  core = require("@core/router"),
  cors = require("cors"),
  helmet = require("helmet"),
  morgan = require("morgan");

// adding Helmet to enhance your API's security
app.use(helmet());

// Use the JSON body parser
app.use(bodyParser.json(bodyParserConfig));

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

// Use parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded(bodyParserConfig));

// Use Form-Data Parser
app.use(upload.any());

// Use Express.Js router
app.use("/", router);

// Takes every request comes in and forward it to core router
core(router);

// Start the server
app.listen(global.port);
