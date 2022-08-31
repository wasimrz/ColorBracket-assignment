const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./config/db");
const { errBuilder, successHandler, isDef } = require("./helpers/index");
const { schedulerFn } = require("./controllers/schedulers");

const app = express();

//models
const { Employee, Task, AssignmentHistory } = require("./models/index");

//routes
const employeRoute = require("./routes/employees");
const taskRoute = require("./routes/tasks");

//BODY-PARSER
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/employees", employeRoute);
app.use("/api/tasks", taskRoute);

app.use((err, req, res, next) => {
  const final_error = errBuilder(err);
  console.log("final_error");
  console.log(final_error);
  return res.status(final_error.statusCode).send(final_error);
});

// relation
Employee.belongsToMany(Task, { through: AssignmentHistory });
Task.belongsToMany(Employee, { through: AssignmentHistory });
AssignmentHistory.belongsTo(Employee, { foreignKey: "employeeId" });
AssignmentHistory.belongsTo(Task, { foreignKey: "taskId" });

schedulerFn();
app.listen(3000, () => {
  console.log("sever started at 3000");
});
