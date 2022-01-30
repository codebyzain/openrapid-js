const fs = require("fs");
const global = require("@/global");
const moment = require("moment");

module.exports = (message, color = "white") => {
  global.debugger === undefined ||
  global.debugger.log === undefined ||
  global.debugger.log.save === undefined ||
  global.debugger.log.save == false
    ? console.log("\n[" + moment().format("YYYY-MM-DD HH:mm:ss").grey + "]\n" + message[color])
    : false;
};

const write = (title, message) => {
  const moment = require("moment");
  var filename = moment().format("YYYY-MM-DD").toString("YYYY-MM-DD HH:mm:ss");
  try {
    title = typeof title == "object" ? JSON.stringify(title) : title;
    if (message !== undefined) {
      message = typeof message == "object" ? JSON.stringify(message) : message;
      title += "\n" + message;
    }
    var data = "[" + moment().format().toString() + "]\n" + title + "\n-\n";
    fs.writeFileSync(global.path + "/app/logs/" + filename + ".log", new Buffer.from(data), {
      flag: "a",
    });
  } catch (e) {
    console.warn(
      "Console Log".bgRed,
      "Make sure to log only string, if you want to log an array or object you convert that into JSON string first"
        .yellow +
        " " +
        e
    );
  }
};

// This function will be activated when you set debugger.log.save to true in your global.js file
console.log =
  global.debugger !== undefined &&
  global.debugger.log !== undefined &&
  global.debugger.log.save !== undefined &&
  global.debugger.log.save == true
    ? (title, message = undefined) => write(title, message)
    : console.log;

console.warn =
  global.debugger !== undefined &&
  global.debugger.log !== undefined &&
  global.debugger.log.save !== undefined &&
  global.debugger.log.save == true
    ? (title, message = undefined) => write(title, message)
    : console.log;

console.error =
  global.debugger !== undefined &&
  global.debugger.log !== undefined &&
  global.debugger.log.save !== undefined &&
  global.debugger.log.save == true
    ? (title, message = undefined) => write(title, message)
    : console.log;
