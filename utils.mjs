import { ERROR_CODES, ERROR_MESSAGES } from "./constants.mjs";

function sendServerError(res, err) {
  if (err instanceof Error) {
    res.status(ERROR_CODES.SERVER_ERROR).json({
      errorCode: ERROR_CODES.SERVER_ERROR,
      errorMessage: "Internal server error: " + err.message,
    });
  }
}

function sendError(res, code, message) {
  res.status(code).json({ errorCode: code, errorMessage: message });
}

function isNoUsersError(res, users) {
  if (!users || !users.length) {
    sendError(res, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NO_USERS_IN_BD);
    return true;
  }

  return false;
}

function getUserID(reqBody) {
  const userIDKey = Object.keys(reqBody)[0];
  const userID = +reqBody[userIDKey];

  return userID;
}

function isUserIDError(res, userID) {
  if (Number.isNaN(userID)) {
    sendError(
      res,
      ERROR_CODES.BAD_REQUEST,
      "UserID" + ERROR_MESSAGES.NOT_VALID_INTEGER
    );
    return true;
  }

  if (!userID) {
    sendError(res, ERROR_CODES.BAD_REQUEST, ERROR_MESSAGES.NO_USER_ID);
    return true;
  }

  return false;
}

function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateString.match(regex)) {
    return false;
  }

  const parts = dateString.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (year < 1000 || year > 9999 || month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  return day > 0 && day <= daysInMonth;
}

function getFormattedCurrentDate() {
  const date = new Date();

  const formattedDate =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  return formattedDate;
}

export {
  sendServerError,
  sendError,
  isNoUsersError,
  getUserID,
  isUserIDError,
  isValidDate,
  getFormattedCurrentDate,
};
