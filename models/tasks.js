const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Task = sequelize.define("task", {
  // Model attributes are defined here
  task: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  desc: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Task;
