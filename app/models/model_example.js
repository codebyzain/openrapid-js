module.exports = class extends require("@model") {
  saveFile = () => {
    this.controller.storage.file.display("images/jancuk.png");
  };
};
