export type TextExtractionInfrastructurePolicy = {
  extractor: "pdf" | "browser-pdf";
  repository: "idb" | "nedb";
};
