module.exports = class extends require("@model") {
  getProducts = async (userId) => {
    const data = await this.database.query("SELECT * FROM user WHERE name LIKE '%" + userId + "%' LIMIT 10");
    return data;
  };
};
