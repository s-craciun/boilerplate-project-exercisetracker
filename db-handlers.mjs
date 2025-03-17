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

async function getExercisesByUserIdAndQueriesFromDB(userId, queries) {
  let sql = "SELECT * FROM exercises WHERE userID = ?";
  const queryParams = [];

  if (queries.from && !queries.to) {
    queryParams.push(queries.from);
    sql += " AND date >= ?";
  }

  if (queries.to && !queries.from) {
    queryParams.push(queries.to);
    sql += " AND date <= ?";
  }

  if (queries.to && queries.from) {
    queryParams.push(queries.from, queries.to);
    sql += " AND date BETWEEN ? AND ?";
  }

  sql += " ORDER BY date ASC";

  if (queries.limit) {
    queryParams.push(queries.limit);
    sql += " LIMIT ?";
  }

  return await db.all(sql, [userId, ...queryParams], function (err, rows) {
    if (err) {
      return err;
    }

    return rows;
  });
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
  getExercisesByUserIdAndQueriesFromDB,
  addNewExerciseToDB,
};
