// Need this to be able to use dirname, cuz it is not available in modules bu default
import { dirname } from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const ERROR_CODES = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  NO_USERS_IN_BD: "No users in the DB",
  NO_USER: "No user with such an ID.",
  NO_USER_ID: "User ID is missing.",
  NO_USERNAME: "Username value is missing.",
  USERNAME_EXISTS: "Username already exists.",

  NO_EXERCISES: "This user has no active exercises.",

  NOT_VALID_INTEGER: " is not valid. An integer value is expected.",
  MISSING_REQUIRED: "Required values are missing.",
  NON_VALID_DATE_FORMAT:
    "The date format is not valid. A 'yyyy-mm-dd' format is expected where (y)(m) and (d) are integers.",
};
