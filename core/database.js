const mysql = require("mysql2");
const config = require("@config/database");
const log = require("@config/log");

function createPool() {
  try {
    const pool = mysql.createPool({
      ...config.credentials["default"],
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    });

    const promisePool = pool.promise();

    return promisePool;
  } catch (error) {
    return console.log(`Could not connect - ${error}`);
  }
}

const pool = createPool();

asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const Database = {
  // Selected Database
  selected: "default",
  connection_stream: async () => pool.getConnection(),
  // Store current result rows
  rows: null,
  // Store current results fields
  fields: null,
  // Establish MySQL database connection
  // run sql query
  query: async function (string, callback = null) {
    try {
      console.log("\n-- Produced SQL Query \n", string.yellow);
      if (config.enabled !== undefined && config.enabled == true) {
        const conn = await Database.connection_stream();
        const [rows, fields] = await conn.execute(string);
        conn.release();
        Database.rows = rows;
        Database.selected = "default";
        return rows;
      } else {
        log(
          "You haven't enabled the database configuration, make sure to set the property to true in order to load database",
          "yellow"
        );
        return null;
      }
    } catch (e) {
      log(e.message, "red");
      return false;
    }
  },
  use: (database) => {
    Database.selected = database;
    return {
      table: Database.table.bind(Database),
    };
  },
  execute: async (str, callback = null) => {
    var executeQuery = await Database.query(str, callback);
    if (callback !== null) {
      return await asyncForEach(executeQuery, callback);
    } else {
      return executeQuery;
    }
  },
  table: (table) => {
    var queryString = "";
    return {
      row: (condition = null) => {
        queryString = `SELECT * FROM ${table} `;
        var cond = "";
        if (condition !== null) {
          if (typeof condition == "object") {
            Object.keys(condition).forEach((item) => {
              var val = Array.isArray(condition[item])
                ? condition[item][0] + " " + mysql.escape(condition[item][1])
                : ` = '${condition[item]}' `;
              if (cond == "") {
                cond = ` WHERE ${item} ${val}`;
              } else {
                cond += ` AND ${item} ${val}`;
              }
            });
            queryString += cond;
          }
        }
        return {
          exist: async () => {
            var exec = await Database.execute(queryString);
            return exec.length > 0;
          },
          select: async (field = null) => {
            var exec = await Database.execute(queryString);
            return exec.length > 0 ? (field == null ? exec[0] : exec[0][field]) : false;
          },
        };
      },
      insert: (data) => {
        var col = [],
          val = [];
        if (!Array.isArray(data)) {
          Object.keys(data).forEach((item) => {
            if (data[item] !== undefined) {
              col.push(item);
              if (data[item] == null) {
                val.push(null);
              } else if (typeof data[item] == "function") {
                data[item]((str) => {
                  val.push(mysql.escape(str));
                });
              } else if (typeof data[item] == "string") {
                val.push(mysql.escape(data[item]));
              } else {
                val.push(mysql.escape(data[item]));
              }
            }
          });
          queryString = `INSERT INTO ${table} (${col.join(", ")}) VALUES (${val.join(", ")})`;
          return {
            execute: () => Database.execute(queryString),
          };
        } else {
          data.map((row, rowIndex) => {
            var rowData = [];
            Object.keys(row).forEach((rowItem) => {
              if (rowIndex == 0) {
                col.push(rowItem);
              }
              if (row[rowItem] == null) {
                rowData.push(null);
              } else if (typeof row[rowItem] == "function") {
                row[rowItem]((str) => {
                  rowData.push(mysql.escape(str));
                });
              } else if (typeof row[rowItem] == "string") {
                rowData.push(mysql.escape(row[rowItem]));
              } else {
                rowData.push(mysql.escape(row[rowItem]));
              }
            });
            val.push("(" + rowData.join(", ") + ")");
          });
          queryString = `INSERT INTO ${table} (${col.join(", ")}) VALUES ${val.join(", ")}`;
          return {
            execute: () => Database.execute(queryString),
          };
        }
      },
      select: (fields) => {
        fields =
          typeof fields == "undefined"
            ? "*"
            : fields === "*"
            ? "*"
            : Array.isArray(fields)
            ? fields.join(", ")
            : fields;
        queryString = `SELECT ${Array.isArray(fields) ? fields.join(", ") : fields} FROM ${table}`;
        return {
          query: (str) => {
            queryString += ` ${str}`;
            return {
              execute: (callback) => Database.execute(queryString, callback),
            };
          },
          sort: (name, value = "") => {
            queryString += ` ORDER BY ${name} ${value}`;
            return {
              execute: () => Database.execute(queryString),
              page: (pageNumber, limit = 10) => {
                var pageLimitstart = pageNumber - 1;
                var pageLimitEnd = pageLimitstart * limit;
                queryString += ` LIMIT ${limit} OFFSET ${pageLimitEnd} `;
                return {
                  execute: () => Database.execute(queryString),
                };
              },
            };
          },
          execute: (callback) => Database.execute(queryString, callback),
          page: (pageNumber, limit = 10) => {
            var pageLimitstart = pageNumber - 1;
            var pageLimitEnd = pageLimitstart * limit;
            queryString += ` LIMIT ${limit} OFFSET ${pageLimitEnd} `;
            return {
              execute: (callback) => Database.execute(queryString, callback),
            };
          },
          where: (condition) => {
            var cond = "";
            if (typeof condition == "object") {
              Object.keys(condition).forEach((item) => {
                var val = Array.isArray(condition[item])
                  ? condition[item][0] + " " + mysql.escape(condition[item][1])
                  : ` = '${condition[item]}' `;
                if (cond == "") {
                  cond = ` WHERE ${item} ${val}`;
                } else {
                  cond += ` AND ${item} ${val}`;
                }
              });
              queryString += cond;
            }
            return {
              sort: (name, value = "") => {
                queryString += ` ORDER BY ${name} ${value}`;
                return {
                  execute: (callback) => Database.execute(queryString, callback),
                  page: (pageNumber, limit = 10) => {
                    var pageLimitstart = pageNumber - 1;
                    var pageLimitEnd = pageLimitstart * limit;
                    queryString += ` LIMIT ${limit} OFFSET ${pageLimitEnd} `;
                    return {
                      execute: (callback) => Database.execute(queryString, callback),
                    };
                  },
                };
              },
              page: (pageNumber, limit = 10) => {
                var pageLimitstart = pageNumber - 1;
                var pageLimitEnd = pageLimitstart * limit;
                queryString += ` LIMIT ${limit} OFFSET ${pageLimitEnd} `;
                return {
                  execute: (callback) => Database.execute(queryString, callback),
                };
              },
              execute: (callback) => Database.execute(queryString, callback),
            };
          },
        };
      },
      update: (data) => {
        var updates = "";
        var conditions = "";
        Object.keys(data).forEach((item) => {
          if (updates == "") {
            updates = ` ${item} = ${mysql.escape(data[item])}`;
          } else {
            updates += ` , ${item} = ${mysql.escape(data[item])}`;
          }
        });
        return {
          execute: () => {
            queryString = `UPDATE ${table} SET ${updates} ${conditions}`;
            return Database.execute(queryString);
          },
          where: (condition) => {
            Object.keys(condition).forEach((item) => {
              var val = Array.isArray(condition[item])
                ? condition[item][0] + " " + mysql.escape(condition[item][1])
                : ` = '${condition[item]}' `;
              if (conditions == "") {
                conditions = ` WHERE ${item} ${val}`;
              } else {
                conditions += ` AND ${item} ${val}`;
              }
            });
            return {
              execute: () => {
                queryString = `UPDATE ${table} SET ${updates} ${conditions}`;
                return Database.execute(queryString);
              },
            };
          },
        };
      },
      delete: () => {
        var conditions = "";
        return {
          where: (condition) => {
            Object.keys(condition).forEach((item) => {
              var val = Array.isArray(condition[item])
                ? condition[item][0] + " " + mysql.escape(condition[item][1])
                : ` = '${condition[item]}' `;
              if (conditions == "") {
                conditions = ` WHERE ${item} ${val}`;
              } else {
                conditions += ` AND ${item} ${val}`;
              }
            });
            return {
              execute: () => {
                queryString = `DELETE FROM ${table} ${conditions}`;
                return Database.execute(queryString);
              },
            };
          },
          execute: () => {
            queryString = `DELETE FROM ${table}`;
            return Database.execute(queryString);
          },
        };
      },
    };
  },
};

module.exports = Database;
