import {
  router,
  ERROR_CODES,
  ERROR_MESSAGES,
  APP_BASE_URL,
  getAllUsersFromDB,
  addNewUserToDB,
  isNoUsersError,
  sendServerError,
  sendError,
} from "../public-api.mjs";

router.get(APP_BASE_URL, async (req, res) => {
  try {
    const users = await getAllUsersFromDB();

    if (isNoUsersError(res, users)) return;

    res.json(users);
  } catch (e) {
    sendServerError(res, e);
  }
});

router.post(APP_BASE_URL, async (req, res) => {
  try {
    let { username } = req.body;
    username = username.trim();

    if (!username) {
      sendError(res, ERROR_CODES.BAD_REQUEST, ERROR_MESSAGES.NO_USERNAME);
      return;
    }

    const users = await getAllUsersFromDB();

    if (users.some((user) => user?.username === username)) {
      sendError(res, ERROR_CODES.CONFLICT, ERROR_MESSAGES.USERNAME_EXISTS);
      return;
    }

    const result = await addNewUserToDB(username);
    res.send(result);
  } catch (e) {
    sendServerError(res, e);
  }
});

export const usersRouter = router;
