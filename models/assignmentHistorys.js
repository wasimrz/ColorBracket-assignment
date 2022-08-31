const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { Employee, Task } = require("./index");

const AssignmentHistory = sequelize.define(
  "AssignmentHistory",
  {
    // Model attributes are defined here
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "in-progress",
    },
  },
  { timestamps: false }
);

module.exports = AssignmentHistory;
