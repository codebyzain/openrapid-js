var jwt = require("jsonwebtoken");
const fs = require("fs");
class Core {
  constructor(req, res, middleware) {
    this.global = require("@/global");
    this.request = req;
    if (res !== undefined) {
      this.response = res;
    }
    if (middleware !== undefined) {
      this.middleware = middleware;
    }
    this.validate = {
      require: {
        body: this.#handleValidateRequestBody,
        header: this.#handleValidateRequestHeader,
      },
    };
    this.token = {
      jwt: {
        secret: "default-openrapid-js",
        generate: this.#handleGenerateJWTToken,
        verify: this.#handleVerifyJWTToken,
      },
    };
    this.storage = {
      file: {
        save: this.#handleFileSave,
        delete: this.#handleFileDelete,
        display: this.#handleFileDisplay,
        download: this.#handleFileDownload,
        getFullPath: this.#handleFilePath,
        getFullURL: this.#handleFileURL,
      },
    };
    this.utils = {
      asyncForEach: this.#asyncForEach,
    };
  }

  #asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

  #handleValidateRequestBody = async (params) => {
    var undefCount = 0;
    params.map((item) => {
      typeof this.request.body[item] == "undefined" ? (undefCount += 1) : null;
    });
    await Promise.all(params);
    return undefCount === 0;
  };

  #handleValidateRequestHeader = async (params) => {
    var undefCount = 0;
    params.map((item) => {
      typeof this.request.headers[item] == "undefined" ? (undefCount += 1) : null;
    });
    await Promise.all(params);
    return undefCount === 0;
  };

  #handleGenerateJWTToken = (object, secret = "", options = {}) => {
    var token = jwt.sign(object, secret == "" ? this.token.jwt.secret : secret, options);
    return token;
  };

  #handleVerifyJWTToken = (token, secret = "", options = {}) => {
    try {
      var decoded = jwt.verify(token, secret == "" ? this.token.jwt.secret : secret, options);
      return {
        valid: true,
        payload: decoded,
      };
    } catch (err) {
      return {
        valid: false,
        payload: null,
      };
    }
  };

  #handleFileDelete = (path) => {
    try {
      fs.unlinkSync(this.global.path + "/app/storage/" + path.replace(this.global.path, ""));
      return true;
    } catch (e) {
      return false;
    }
  };

  #handleFilePath = (storagePath) => {
    storagePath = storagePath.substr(0, 1) !== "/" ? "/" + storagePath : storagePath;
    return this.global.path + "/app/storage" + storagePath;
  };

  #handleFileURL = (storagePath) => {
    storagePath = storagePath.substr(0, 1) !== "/" ? "/" + storagePath : storagePath;
    var fullUrl = this.request.protocol + "://" + this.request.get("host") + storagePath;
    return fullUrl;
  };

  #handleFileDisplay = (filePath) => {
    const directoryPath = filePath.substr(0, 1) !== "/" ? "/" + filePath : filePath;
    filePath = this.global.path + "/app/storage/" + directoryPath;
    if (fs.existsSync(filePath)) {
      try {
        this.response.sendFile(filePath);
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  };
  // Download file from storage directory
  #handleFileDownload = (filePath, downloadAliasName = "") => {
    const directoryPath = filePath.substr(0, 1) !== "/" ? "/" + filePath : filePath;
    filePath = this.global.path + "/app/storage/" + directoryPath;
    console.log(filePath);
    if (fs.existsSync(filePath)) {
      try {
        if (downloadAliasName != "") {
          this.response.download(filePath, downloadAliasName);
          return true;
        } else {
          this.response.download(filePath);
          return true;
        }
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  };

  #handleFileSave = async (args = {}) => {
    var fileUploaded = 0;
    var uploadedFiles = {};
    var fileFailedUpload = 0;
    await this.#asyncForEach(this.request.files, (file) => {
      var directory =
        args[file.fieldname] !== undefined && args[file.fieldname].destination !== undefined
          ? args[file.fieldname].destination + "/"
          : "/";
      var path = this.global.path + "/app/storage" + directory;
      var filePath = file.originalname.substr(file.originalname.lastIndexOf(".") + 1);
      var fileName =
        args[file.fieldname] !== undefined && args[file.fieldname].rename !== undefined
          ? args[file.fieldname].rename + "." + filePath
          : file.originalname;
      path += fileName;
      try {
        fs.writeFileSync(
          path,
          new Buffer.from(file.buffer),
          args[file.fieldname] !== undefined && args[file.fieldname].option ? args[file.fieldname].option : {}
        );
        fileUploaded += 1;
        Object.assign(uploadedFiles, {
          [file.fieldname]: path.replace(this.global.path + "/app/storage", ""),
        });
      } catch (e) {
        fileFailedUpload += 1;
      }
    });
    return {
      files: uploadedFiles,
      total: fileUploaded,
      saved: fileUploaded,
      failed: fileFailedUpload,
    };
  };
}

module.exports = Core;
