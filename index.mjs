import express, { static as _static } from "express";
import { Database } from "sqlite-async";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import { logsRouter } from "./routes/logs.mjs";
import { usersRouter } from "./routes/users.mjs";
import { exercisesRouter } from "./routes/exercises.mjs";

import { __dirname, APP_BASE_URL } from "./constants.mjs";

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

app.use(usersRouter);
app.use(APP_BASE_URL, exercisesRouter);
app.use(APP_BASE_URL, logsRouter);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
