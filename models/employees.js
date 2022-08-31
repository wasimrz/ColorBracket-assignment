const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Employee = sequelize.define("employee", {
  // Model attributes are defined here
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Employee;
