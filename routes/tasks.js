const taskCtrl = require("../controllers/tasks");

const express = require("express");
const router = express.Router();

router.post("/", taskCtrl.createTasks);

module.exports = router;
