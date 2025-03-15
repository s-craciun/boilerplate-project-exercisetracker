import express, { static as _static, query } from "express";
import { Database } from "sqlite-async";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import {
  getAllUsersFromDB,
  addNewUserToDB,
  getExercisesByUserIdFromDB,
  addNewExerciseToDB,
} from "./db-handlers.mjs";
import {
  sendServerError,
  sendError,
  isNoUsersError,
  getUserID,
  isUserIDError,
  isValidDate,
  getFormattedCurrentDate,
} from "./utils.mjs";
import { __dirname, ERROR_CODES, ERROR_MESSAGES } from "./constants.mjs";

dotenv.config();
const app = express();

app.use(cors());
app.use(_static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

export let db;

Database.open("my.db")
  .then((_db) => {
    db = _db;

    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY NOT NULL,
      username VARCHAR(255) NOT NULL
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY NOT NULL,
      userID INTEGER NOT NULL,
      description VARCHAR(255) NOT NULL,
      duration INTEGER NOT NULL,
      date DATE,
      FOREIGN KEY (userID) REFERENCES users(id)
    )
  `);
  })
  .catch((err) => console.error(err));

app.get("/api/users", async (req, res) => {
  try {
    const users = await getAllUsersFromDB();

    if (isNoUsersError(res, users)) return;

    res.json(users);
  } catch (e) {
    sendServerError(res, e);
  }
});

app.post("/api/users", async (req, res) => {
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

app.post("/api/users/:_id/exercises", async (req, res) => {
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

    if (Number.isNaN(+duration)) {
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

    const users = await getAllUsersFromDB();

    if (isNoUsersError(res, users)) return;

    if (!users.some((user) => user.id === userID)) {
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

app.post("/api/users/:_id/logs", async (req, res) => {
  try {
    const userID = getUserID(req.body);

    if (isUserIDError(res, userID)) return;

    const users = await getAllUsersFromDB();

    if (isNoUsersError(res, users)) return;

    const targetUser = users.find((user) => user.id === userID);

    if (!targetUser) {
      sendError(res, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NO_USER);
      return;
    }

    let exercises = await getExercisesByUserIdFromDB(targetUser.id);

    if (!exercises || !exercises.length) {
      sendError(res, ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NO_EXERCISES);
      return;
    }

    exercises.sort((a, b) => new Date(a.date) - new Date(b.date));

    const { from, to, limit } = req.query;

    if (from) {
      if (isValidDate(from)) {
        exercises = exercises.filter(
          (ex) => ex.date && new Date(ex.date) >= new Date(from)
        );
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
        exercises = exercises.filter(
          (ex) => ex.date && new Date(ex.date) <= new Date(to)
        );
      } else {
        sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          ERROR_MESSAGES.NON_VALID_DATE_FORMAT
        );
        return;
      }
    }

    if (!exercises || !exercises.length) {
      sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        ERROR_MESSAGES.NO_EXERCISES_FOR_PERIOD
      );
      return;
    }

    if (limit) {
      if (!Number.isNaN(limit)) {
        exercises = exercises.slice(0, limit);
      } else {
        sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          "Limit" + ERROR_MESSAGES.NOT_VALID_INTEGER
        );
        return;
      }
    }

    const responseBody = {
      ...targetUser,
      logs: exercises,
      count: exercises.length,
    };

    res.send(responseBody);
  } catch (e) {
    sendServerError(res, e);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
