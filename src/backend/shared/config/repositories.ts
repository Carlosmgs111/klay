import { Level } from "level";

let textsDB: Level;

export function getTextsDB() {
  if (!textsDB) {
    textsDB = new Level("./database/level/texts", { valueEncoding: "json" });
  }
  return textsDB;
}

let promptsDB: Level;

export function getPromptsDB() {
  if (!promptsDB) {
    promptsDB = new Level("./database/level/prompts", { valueEncoding: "json" });
  }
  return promptsDB;
}

let embeddingsDB: Level;

export function getEmbeddingsDB() {
  if (!embeddingsDB) {
    embeddingsDB = new Level("./database/level/embeddings", { valueEncoding: "json" });
  }
  return embeddingsDB;
}

let knowledgeAssetsDB: Level;

export function getKnowledgeAssetsDB() {
  if (!knowledgeAssetsDB) {
    knowledgeAssetsDB = new Level("./database/level/knowledgeAssets", { valueEncoding: "json" });
  }
  return knowledgeAssetsDB;
}
