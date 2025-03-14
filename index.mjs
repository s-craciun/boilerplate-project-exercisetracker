import express, { static as _static } from "express";
import { Database } from "sqlite-async";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import {
  getAllUsersFromDB,
  getUserByIdFromDB,
  addNewUserToDB,
  getExerciseByIdFromDB,
  getExercisesByUserIdFromDB,
  addNewExerciseToDB,
} from "./db-handlers.mjs";
import { sendServerError, sendError, trimInputValues } from "./utils.mjs";

import { __dirname, ERROR_CODES } from "./constants.mjs";

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

    if (!users || !users.length) {
      sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "No users in the DB. Please go ahead and add any."
      );
      return;
    }

    res.json(users);
  } catch (e) {
    sendServerError(res, e);
  }
});

app.post("/api/users", async (req, res) => {
  try {
    let { username } = req.body;

    trimInputValues(username);

    if (!username) {
      sendError(res, ERROR_CODES.BAD_REQUEST, "Username is required.");
      return;
    }

    const users = await getAllUsersFromDB();

    if (users.some((user) => user?.username === username)) {
      sendError(
        res,
        ERROR_CODES.CONFLICT,
        "Username already exists. You are not as creative as you thought :D"
      );
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
    const userIDKey = Object.keys(req.body)[0];
    const userID = +req.body[userIDKey];
    let { description, duration, date } = req.body;

    trimInputValues(description, duration, date);

    if (!userID) {
      sendError(res, ERROR_CODES.BAD_REQUEST, "Username value is missing.");
      return;
    }

    if (!description || !duration) {
      sendError(res, ERROR_CODES.BAD_REQUEST, "Required values are missing.");
      return;
    }

    const users = await getAllUsersFromDB();

    if (!users || !users.length) {
      sendError(res, ERROR_CODES.NOT_FOUND, "No users in the DB.");
      return;
    }
    if (!users.some((user) => user.id === userID)) {
      sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "No user with such an ID... Who stole him?.."
      );
      return;
    }

    const result = await addNewExerciseToDB({
      userID: userID,
      description: req.body.description,
      duration: +req.body.duration,
      date: new Date(),
    });

    res.send(result);
  } catch (e) {
    sendServerError(res, e);
  }
});

app.post("/api/users/:_id/logs", async (req, res) => {
  try {
    const userIDKey = Object.keys(req.body)[0];
    let userID = +req.body[userIDKey];

    if (!userID) {
      sendError(res, ERROR_CODES.BAD_REQUEST, "UserID is required.");
      return;
    }

    const users = await getAllUsersFromDB();
    const targetUser = users.find((user) => user.id === +userID);

    if (!targetUser) {
      sendError(res, ERROR_CODES.NOT_FOUND, "No such an user in the DB.");
      return;
    }

    const exercises = await getExercisesByUserIdFromDB(targetUser.id);

    if (!exercises || !exercises.length) {
      sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "This user has no active exercises."
      );
      return;
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
