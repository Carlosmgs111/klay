// Dynamic import to avoid loading Level in browser context
let LevelClass: typeof import("level").Level | null = null;

async function ensureLevelLoaded() {
  if (!LevelClass) {
    const levelModule = await import("level");
    LevelClass = levelModule.Level;
  }
  return LevelClass;
}

let textsDB: any;

export async function getTextsDB() {
  if (!textsDB) {
    const Level = await ensureLevelLoaded();
    textsDB = new Level("./database/level/texts", { valueEncoding: "json" });
  }
  return textsDB;
}

let promptsDB: any;

export async function getPromptsDB() {
  if (!promptsDB) {
    const Level = await ensureLevelLoaded();
    promptsDB = new Level("./database/level/prompts", { valueEncoding: "json" });
  }
  return promptsDB;
}

let embeddingsDB: any;

export async function getEmbeddingsDB() {
  if (!embeddingsDB) {
    const Level = await ensureLevelLoaded();
    embeddingsDB = new Level("./database/level/embeddings", { valueEncoding: "json" });
  }
  return embeddingsDB;
}

let knowledgeAssetsDB: any;

export async function getKnowledgeAssetsDB() {
  if (!knowledgeAssetsDB) {
    const Level = await ensureLevelLoaded();
    knowledgeAssetsDB = new Level("./database/level/knowledge-assets", { valueEncoding: "json" });
  }
  return knowledgeAssetsDB;
}
