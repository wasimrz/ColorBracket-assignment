const employeeCtrl = require("../controllers/employees");

const express = require("express");
const router = express.Router();

router.post("/", employeeCtrl.createEmployees);
router.post("/:employeeId/tasks/:taskId", employeeCtrl.createAssignment);
router.get("/excel", employeeCtrl.generateExcelFileOnEmployeeDetails);
router.get("/", employeeCtrl.getEmployeeDetails);

module.exports = router;
