let cron = require("node-cron");
const {
  isDef,
  successHandler,
  errBuilder,
  addDaysToDate,
  getMonday,
  subtractDaysToDate,
} = require("../helpers");
const Boom = require("@hapi/boom");
const { isEmpty, trim, capitalize } = require("lodash");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//MODELS
const {
  Employee,
  AssignmentHistory,
  Task,
  EmployeeOftheDay,
} = require("../models/index");

exports.schedulerFn = () => {
  try {
    console.log("run");
    const task = cron.schedule(
      "0 0 * * *",
      async () => {
        let startDate = new Date();
        let endDate = subtractDaysToDate(startDate, 1);

        let employeeOfTheDay = await AssignmentHistory.findAll({
          group: ["employeeId"],
          where: {
            status: "done",
            date: {
              [Op.gte]: endDate,
              [Op.lt]: startDate,
            },
          },
          include: {
            model: Employee,
            attributes: ["id", "name", "designation"],
          },
          attributes: [
            "employeeId",
            [Sequelize.fn("COUNT", "employeeId"), "count"],
          ],
        });

        employeeOfTheDay = JSON.parse(JSON.stringify(employeeOfTheDay));
        let maxCount = Math.max(...employeeOfTheDay.map((o) => o.count));

        employeeOfTheDay = employeeOfTheDay.find((obj) => {
          return obj.count == maxCount;
        });

        if (!isDef(employeeOfTheDay)) {
          return;
        }
        let employeeOftheDayObj = {
          completedTask: employeeOfTheDay.count,
          designation: employeeOfTheDay.employee.designation,
          emp_name: employeeOfTheDay.employee.name,
          date: endDate,
        };

        let savedEmployeOftheDay = await EmployeeOftheDay.create(
          employeeOftheDayObj
        );
      },
      {
        scheduled: true,
      }
    );

    task.start();
  } catch (error) {
    throw Boom.boomify(error);
  }
};
