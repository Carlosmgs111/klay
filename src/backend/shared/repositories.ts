import { Level } from "level";

let db: Level;

export function getDB() {
  if (!db) {
    db = new Level("./database/level/texts", { valueEncoding: "json" });
  }
  return db;
}
