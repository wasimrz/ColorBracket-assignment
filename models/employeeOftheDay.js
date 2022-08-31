const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EmployeeOftheDay = sequelize.define("employeeOftheDay", {
  // Model attributes are defined here
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  emp_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  completedTask: {
    type: DataTypes.INTEGER,
  },
});

module.exports = EmployeeOftheDay;
