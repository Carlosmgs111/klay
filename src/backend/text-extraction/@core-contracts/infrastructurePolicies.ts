export type TextExtractionInfrastructurePolicy = {
  extractor: "pdf" | "docx" | "txt";
  repository: "local-level" | "remote-db" | "browser";
};