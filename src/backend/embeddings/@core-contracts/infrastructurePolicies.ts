export type EmbeddingsInfrastructurePolicy = {
  provider: "cohere" | "hugging-face" | "openai";
  repository: "local-level" | "remote-db";
};