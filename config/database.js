module.exports = {
  enabled: true,
  // Database configuration
  // Suports only one database connection
  credentials: {
    default: {
      // Database name
      database: "test",
      // Database host / ip address
      port: 8889,
      // Database username access
      user: "root",
      // Database password
      password: "root",
      charset: "utf8mb4",
    },
    product: {
      // Database name
      database: "product",
      // Database host / ip address
      port: 8889,
      // Database username access
      user: "root",
      // Database password
      password: "root",
      charset: "utf8mb4",
    },
  },
  errorHandler: function (error) {
    console.log(error);
  },
};
