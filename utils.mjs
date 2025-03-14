import { ERROR_CODES } from "./constants.mjs";

function sendServerError(res, err) {
  if (err instanceof Error) {
    res
      .status(ERROR_CODES.SERVER_ERROR)
      .json({ errorCode: ERROR_CODES.SERVER_ERROR, errorMessage: err.message });
  }
}

function sendError(res, code, message) {
  res.status(code).json({ errorCode: code, errorMessage: message });
}

function trimInputValues(...args) {
  if (!args) return;

  for (let i = 0; i < args.length; i++) {
    args[i] = args[i].trim();
  }
}

export { sendServerError, sendError, trimInputValues };
