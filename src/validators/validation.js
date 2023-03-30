const mongoose = require("mongoose");

const isValidEmail = function (mail) {
  if (/^[a-z0-9_]{1,}@[a-z]{3,}[.]{1}[a-z]{3,6}$/.test(mail)) {
    return true;
  }
};

const isValidName = function (name) {
  if (/^[a-zA-Z\.]*$/.test(name)) return true;
  return false;
};

const isValidPhone = function (phone) {
  if (/^[\s]*[6-9]\d{9}[\s]*$/gi.test(phone)) return true;
  return false;
};

const isValidRequestBody = function (requestBody) {
  if (Object.keys(requestBody).length > 0) return true;
  return false;
};

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

module.exports = {
  isValid,
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidRequestBody,
  isValidObjectId,
};
