import { db } from "./index.mjs";

async function getAllUsersFromDB() {
  const sql = "SELECT * FROM users";
  return await db.all(sql, (err, rows) => {
    if (err) {
      return err;
    }
    return rows;
  });
}

async function getUserByIdFromDB(userId) {
  return await db.get(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    function (err, row) {
      if (err) {
        return err;
      }

      return row;
    }
  );
}

async function addNewUserToDB(username) {
  const sql = "INSERT INTO users(username) VALUES (?)";
  const { lastID } = await db.run(sql, [username], (err) => {
    if (err) {
      return err;
    }
  });

  return await getUserByIdFromDB(lastID);
}

async function getExerciseByIdFromDB(exerciseId) {
  return await db.get(
    "SELECT * FROM exercises WHERE id = ?",
    [exerciseId],
    function (err, row) {
      if (err) {
        return err;
      }

      return row;
    }
  );
}

async function getExercisesByUserIdFromDB(userId) {
  return await db.all(
    "SELECT * FROM exercises WHERE userID = ? ORDER BY date ASC",
    [userId],
    function (err, rows) {
      if (err) {
        return err;
      }

      return rows;
    }
  );
}

async function addNewExerciseToDB(exercise) {
  const { userID, description, duration, date } = exercise;
  const sql =
    "INSERT INTO exercises(userID, description, duration, date) VALUES (?, ?, ?, ?)";
  const { lastID } = await db.run(
    sql,
    [userID, description, duration, date || null],
    (err) => {
      if (err) {
        return err;
      }
    }
  );

  return await getExerciseByIdFromDB(lastID);
}

export {
  getAllUsersFromDB,
  getUserByIdFromDB,
  addNewUserToDB,
  getExerciseByIdFromDB,
  getExercisesByUserIdFromDB,
  addNewExerciseToDB,
};
