const {
  isDef,
  successHandler,
  errBuilder,
  addDaysToDate,
  getMonday,
} = require("../helpers");
const Boom = require("@hapi/boom");
const { isEmpty, trim, capitalize, map, forEach } = require("lodash");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
let excel = require("excel4node");

//MODELS
const { Employee, AssignmentHistory, Task } = require("../models/index");
const { Promise } = require("sequelize");

exports.createEmployees = async (req, res, next) => {
  try {
    const employeeData = req.body.employeeDetails;
    if (!isDef(employeeData) || isEmpty(employeeData)) {
      throw Boom.badRequest("Employee data required");
    }

    if (!isDef(employeeData.name) || isEmpty(trim(employeeData.name))) {
      throw Boom.badRequest("Employee name required");
    }

    if (
      !isDef(employeeData.designation) ||
      isEmpty(trim(employeeData.designation))
    ) {
      throw Boom.badRequest("Employee designation required");
    }

    let employeeObj = {
      name: capitalize(employeeData.name),
      designation: employeeData.designation,
    };

    const savedEmployee = await Employee.create(employeeObj);
    if (!isDef(savedEmployee) || isEmpty(savedEmployee)) {
      throw Boom.badRequest("Something went wrong employee creation failed");
    }

    return successHandler(
      res,
      { employee: savedEmployee },
      "Employee saved successfully"
    );
  } catch (error) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    let employeeId = req.params.employeeId;
    let taskId = req.params.taskId;
    let assignmentDetails = req.body.assignmentDetails;

    if (!isDef(assignmentDetails) || isEmpty(assignmentDetails)) {
      throw Boom.badRequest("Assignment details required");
    }

    if (
      !isDef(assignmentDetails.date) ||
      isEmpty(trim(assignmentDetails.date))
    ) {
      throw Boom.badRequest("assignment date required");
    }

    if (!isDef(employeeId) || isEmpty(employeeId)) {
      throw Boom.badRequest("Employee id required");
    }

    if (!isDef(taskId) || isEmpty(taskId)) {
      throw Boom.badRequest("Task id required");
    }

    let isEmployeePresent = await Employee.findByPk(employeeId);

    if (!isDef(isEmployeePresent) || isEmpty(isEmployeePresent)) {
      throw Boom.badRequest("Employee not found");
    }

    let isTaskPresent = await Task.findByPk(taskId);

    if (!isDef(isTaskPresent) || isEmpty(isTaskPresent)) {
      throw Boom.badRequest("Task not found");
    }

    let isthisTaskIsALreadyAssignedToThisUser = await AssignmentHistory.findOne(
      {
        where: {
          employeeId: employeeId,
          taskId: taskId,
          status: "in-progress",
        },
      }
    );

    console.log({ isthisTaskIsALreadyAssignedToThisUser });

    if (
      isDef(isthisTaskIsALreadyAssignedToThisUser) ||
      !isEmpty(isthisTaskIsALreadyAssignedToThisUser)
    ) {
      throw Boom.badRequest("This task is already assigned to this employee");
    }

    let assignmentObj = {
      date: assignmentDetails.date,
      taskId: taskId,
      employeeId: employeeId,
    };

    const savedAssignment = await AssignmentHistory.create(assignmentObj);
    if (!isDef(savedAssignment) || isEmpty(savedAssignment)) {
      throw Boom.badRequest("Something went wrong assignment creation failed");
    }

    return successHandler(
      res,
      { assignment: savedAssignment },
      "Assignment saved successfully"
    );
  } catch (error) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

exports.getEmployeeDetails = async (req, res, next) => {
  try {
    let date = req.query.date;

    if (!isDef(date) || isEmpty(date)) {
      throw Boom.badRequest("Date required");
    }

    let startingdWeekDate = getMonday(date);
    console.log({ startingdWeekDate });

    let lastDateOfWeek = addDaysToDate(startingdWeekDate, 7);
    console.log({ lastDateOfWeek });

    //   SELECT COUNT(*) FROM assignmentHistory WHERE date BETWEEN start_week AND end_week GROUP BY emp_id;

    let employeeOfTheWeeks = await AssignmentHistory.findAll({
      group: ["employeeId"],
      where: {
        status: "done",
        date: {
          [Op.gte]: startingdWeekDate,
          [Op.lte]: lastDateOfWeek,
        },
      },
      include: {
        model: Employee,
        attributes: ["id", "name"],
      },
      attributes: [
        "employeeId",
        [Sequelize.fn("COUNT", "employeeId"), "count"],
      ],
    });

    employeeOfTheWeeks = JSON.parse(JSON.stringify(employeeOfTheWeeks));
    let max = Math.max(...employeeOfTheWeeks.map((o) => o.count));

    let employeeOfTheWeek = employeeOfTheWeeks.find((obj) => {
      return obj.count == max;
    });
    let endDate = addDaysToDate(date, 1);
    let isodate = new Date(date);

    let employeeOfTheDay = await AssignmentHistory.findAll({
      group: ["employeeId"],
      where: {
        status: "done",
        date: {
          [Op.gt]: isodate,
          [Op.lte]: endDate,
        },
      },
      include: {
        model: Employee,
        attributes: ["id", "name"],
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

    let getMonth = new Date(date).getMonth();
    console.log({ getMonth });
    let employeeOfTheMonth = await AssignmentHistory.findAll({
      group: ["employeeId"],
      where: {
        status: "done",
        date: Sequelize.where(
          Sequelize.fn("month", Sequelize.col("date")),
          getMonth + 1
        ),
      },
      include: {
        model: Employee,
        attributes: ["id", "name"],
      },
      attributes: [
        "employeeId",
        [Sequelize.fn("COUNT", "employeeId"), "count"],
      ],
    });

    employeeOfTheMonth = JSON.parse(JSON.stringify(employeeOfTheMonth));
    let maxCountMonth = Math.max(...employeeOfTheMonth.map((o) => o.count));

    employeeOfTheMonth = employeeOfTheMonth.find((obj) => {
      return obj.count == maxCountMonth;
    });
    if (!isDef(employeeOfTheDay)) {
      employeeOfTheDay = {};
    }
    if (!isDef(employeeOfTheWeek)) {
      employeeOfTheWeek = {};
    }
    if (!isDef(employeeOfTheMonth)) {
      employeeOfTheMonth = {};
    }
    return successHandler(
      res,
      {
        employeeOfTheDay,
        employeeOfTheWeek,
        employeeOfTheMonth,
      },
      "Employee details retrive successfully"
    );
  } catch (error) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

exports.generateExcelFileOnEmployeeDetails = async (req, res, next) => {
  try {
    let employees = await Employee.findAll();

    let employeeId = map(employees, "id");

    let employeeDetails = await Employee.findAll({
      include: {
        model: Task,
        attributes: ["id", "task", "desc"],
      },
    });

    employeeDetails = JSON.parse(JSON.stringify(employeeDetails));

    await generateExcelFile(employeeDetails);

    return successHandler(res, {}, "file created successfully");
  } catch (error) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

////////////////////////
///COMMON FUNCTION
///////////////////////
async function generateExcelFile(employeeArray) {
  let workbook = new excel.Workbook();

  // Style for headers
  var style = workbook.createStyle({
    font: {
      color: "#EA3A14",
      size: 18,
    },
    numberFormat: "$#,##0.00; ($#,##0.00); -",
  });
  let workSheets = [];

  map(employeeArray, (element) => {
    let worksheet = workbook.addWorksheet(element.name);
    workSheets.push(worksheet);
  });
  // Add Worksheets to the workbook
  forEach(workSheets, (element) => {
    element.cell(1, 1).string("id").style(style);
    element.cell(1, 2).string("name").style(style);
    element.cell(1, 3).string("designation").style(style);
  });

  const styleForData = workbook.createStyle({
    font: {
      color: "#47180E",
      size: 12,
    },
    alignment: {
      wrapText: true,
      horizontal: "center",
    },
    numberFormat: "$#,##0.00; ($#,##0.00); -",
  });

  //   forEach(workSheets, async (element) => {
  await generateExcelSheet(employeeArray, workSheets);
  //   });
  workbook.write("Excel.xlsx");
}

async function generateExcelSheet(array, worksheet) {
  let workbook = new excel.Workbook();
  const styleForData = workbook.createStyle({
    font: {
      color: "#47180E",
      size: 12,
    },
    alignment: {
      wrapText: true,
      horizontal: "center",
    },
    numberFormat: "$#,##0.00; ($#,##0.00); -",
  });
  let row = 2; //Row starts from 2 as 1st row is for headers.
  for (let i in array) {
    let o = 1;
    //This depends on numbers of columns to fill.
    if (array[i].name == worksheet[i].name) {
      worksheet[i]
        .cell(row, o)
        .string(array[i].id.toString())
        .style(styleForData);
      worksheet[i]
        .cell(row, o + 1)
        .string(array[i].name)
        .style(styleForData);
      worksheet[i]
        .cell(row, o + 2)
        .string(array[i].designation)
        .style(styleForData);

      row = row + 1;
    }
  }
}
