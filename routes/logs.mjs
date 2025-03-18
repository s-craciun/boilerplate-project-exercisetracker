import {
  router,
  ERROR_CODES,
  ERROR_MESSAGES,
  getUserByIdFromDB,
  getExercisesByUserIdAndQueriesFromDB,
  sendServerError,
  sendError,
  getUserID,
  isUserIDError,
  isValidDate,
} from "../public-api.mjs";

router.get("/:_id/logs", async (req, res) => {
  try {
    const userID = getUserID(req.params);

    if (isUserIDError(res, userID)) return;

    const targetUser = await getUserByIdFromDB(userID);

    if (!targetUser) {
      sendError(res, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NO_USER);
      return;
    }

    const { from, to, limit } = req.query;
    const queries = {};

    if (from) {
      if (isValidDate(from)) {
        queries.from = from;
      } else {
        sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          ERROR_MESSAGES.NON_VALID_DATE_FORMAT
        );
        return;
      }
    }

    if (to) {
      if (isValidDate(to)) {
        queries.to = to;
      } else {
        sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          ERROR_MESSAGES.NON_VALID_DATE_FORMAT
        );
        return;
      }
    }

    if (limit) {
      if (!Number.isNaN(limit) && limit > 0) {
        queries.limit = limit;
      } else {
        sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          "Limit" + ERROR_MESSAGES.NOT_VALID_INTEGER
        );
        return;
      }
    }

    const { count, exercises } = await getExercisesByUserIdAndQueriesFromDB(
      targetUser.id,
      queries
    );

    if ((queries.limit || queries.to) && (!exercises || !exercises.length)) {
      sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        ERROR_MESSAGES.NO_EXERCISES_FOR_PERIOD
      );
      return;
    }

    if (!exercises || !exercises.length) {
      sendError(res, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NO_EXERCISES);
      return;
    }

    const responseBody = {
      ...targetUser,
      logs: exercises,
      count: count,
    };

    res.send(responseBody);
  } catch (e) {
    sendServerError(res, e);
  }
});

export const logsRouter = router;
