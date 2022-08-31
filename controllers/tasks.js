const { isDef, successHandler, errBuilder } = require("../helpers");
const Boom = require("@hapi/boom");
const { isEmpty, trim } = require("lodash");

//MODELS
const { Task } = require("../models/index");

exports.createTasks = async (req, res, next) => {
  try {
    const taskData = req.body.taskDetails;
    if (!isDef(taskData) || isEmpty(taskData)) {
      throw Boom.badRequest("Task data required");
    }

    if (!isDef(taskData.task) || isEmpty(trim(taskData.task))) {
      throw Boom.badRequest("Task required");
    }

    if (!isDef(taskData.desc) || isEmpty(trim(taskData.desc))) {
      throw Boom.badRequest("Task description required");
    }

    let taskObj = {
      task: taskData.task,
      desc: taskData.desc,
    };

    const savedTask = await Task.create(taskObj);

    if (!isDef(savedTask) || isEmpty(savedTask)) {
      throw Boom.badRequest("Something went wrong task creation failed");
    }
    return successHandler(
      res,
      { task: savedTask },
      "Task detail saved successfully"
    );
  } catch (error) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};
