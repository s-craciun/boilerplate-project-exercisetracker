import {
  router,
  ERROR_CODES,
  ERROR_MESSAGES,
  getUserByIdFromDB,
  addNewExerciseToDB,
  sendServerError,
  sendError,
  getUserID,
  isUserIDError,
  isValidDate,
  getFormattedCurrentDate,
} from "../public-api.mjs";

router.post("/:_id/exercises", async (req, res) => {
  try {
    const userID = getUserID(req.body);
    let { description, duration, date } = req.body;
    description = description.trim();
    duration = duration.trim();
    date = date.trim();

    if (isUserIDError(res, userID)) return;

    if (!description || !duration) {
      const missing = [];
      !description && missing.push("description");
      !duration && missing.push("duration");

      const missingHint = ` (Missing: ${missing.join(", ")})`;

      sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        ERROR_MESSAGES.MISSING_REQUIRED + missingHint
      );
      return;
    }

    if (Number.isNaN(+duration) || duration < 0) {
      sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Duration" + ERROR_MESSAGES.NOT_VALID_INTEGER
      );
      return;
    }

    let actualDate = null;

    if (date) {
      if (isValidDate(date)) {
        actualDate = date;
      } else {
        sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          ERROR_MESSAGES.NON_VALID_DATE_FORMAT
        );
        return;
      }
    } else {
      actualDate = getFormattedCurrentDate();
    }

    const targetUser = await getUserByIdFromDB(userID);

    if (!targetUser) {
      sendError(res, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NO_USER);
      return;
    }

    const result = await addNewExerciseToDB({
      userID: userID,
      description: description,
      duration: duration,
      date: actualDate,
    });

    res.send(result);
  } catch (e) {
    sendServerError(res, e);
  }
});

export const exercisesRouter = router;
