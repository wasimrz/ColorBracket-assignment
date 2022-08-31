const Boom = require("@hapi/boom");
const { omit, isNull, isUndefined, isEmpty } = require("lodash");

const httpResp = (status, message, code, data, metadata) => {
  const response = {
    status: status,
    message: message,
    code: code,
    statusCode: code,
    data: data,
  };
  if (isDef(metadata)) {
    response.metadata = metadata;
  }
  return response;
};

const isDef = (param) => {
  if (isNull(param) || isUndefined(param)) {
    return false;
  } else {
    return true;
  }
};

const errBuilder = (err) => {
  let final_error = err;

  if (err.isServer) {
    // log the error...
    // probably you don't want to log unauthorized access
    // or do you?
  }

  // Restructuring error data
  // If the error belongs to boom error (Check boom module: https://www.npmjs.com/package/boom)
  if (err.isBoom) {
    console.log("Boom old err");
    console.log(err);
    // err.output.statusCode = 400;
    err.output.payload.status = false;
    err.output.payload.code = err.output.statusCode;
    if (isDef(err.data)) {
      err.output.payload.data = err.data;
    }
    err.reformat();
    console.log("NEW err");
    console.log(err);
    final_error = err.output.payload;
    if (isDef(err.message) && final_error.statusCode == 500) {
      final_error.message = err.message;
    }

    // return res.status(err.output.statusCode).send(err.output.payload);
  } else {
    // If the error are other errors
    err.status = false;
    err.code = err.statusCode;
    if (!isDef(err.message) && isDef(err.type)) {
      err.message = err.type;
    }
  }

  return final_error;
};

const errHandler = (error, res) => {
  const resp = httpResp(false, "There is some error occured", 500, error);
};

const successHandler = (res, data, message, metadata) => {
  message = message || "Operation successful";
  let resp;
  if (isDef(metadata)) {
    resp = httpResp(true, message, 200, data, metadata);
  } else {
    resp = httpResp(true, message, 200, data);
  }

  return res.status(resp.code).send(resp);
};

function getMonday(d) {
  d = new Date(d);
  let day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

const addDaysToDate = (date, days) => {
  return new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000);
};

const subtractDaysToDate = (date, days) => {
  return new Date(new Date(date).getTime() - days * 24 * 60 * 60 * 1000);
};

module.exports = {
  httpResp,
  isDef,
  getMonday,
  errBuilder,
  errHandler,
  addDaysToDate,
  successHandler,
  subtractDaysToDate,
};
