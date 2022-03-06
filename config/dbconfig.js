const Sequelize = require("sequelize");
const config = {
    host: 'localhost',
    dialect: 'mssql',
    logging: false,
    dialectOptions: {
      authentication: {
        type: 'ntlm',
        options: {
          domain: 'DOMAIN',
          userName: 'KRISHNA\krish',
          password: 'forkitt0eAtit',
          requestTimeout: 300000
        },
      }
    },
  };
// const sequelize = new Sequelize('SQLPRACTICE', null, null, config);
const sequelize = new Sequelize('SQLPRACTICE', 'admin', 'admin', {
    host: 'localhost',
    dialect: 'mssql',
    pool: {
        max: 30,
        min: 0,
        acquire: 60000,
        idle: 10000
    },
    dialectOptions: {
        connectTimeout: 60000
    }
});

/*'Krishna', 'Windows/7', {
    dialect:"mssql",
    host:"localhost",
    dialectOptions: {
        encrypt: true
    } forkitt0eAtit
})*/
module.exports = sequelize;