const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("colorbracket", "root", "pwd", {
  host: "localhost",
  dialect: "mysql",

  // pool: {
  //   max: 5,
  //   min: 0,
  //   idle: 10000,
  // },
});

async function syncUp() {
  try {
    await sequelize.sync();
  } catch (error) {
    console.log(error);
  }
}

syncUp();

module.exports = { sequelize };
