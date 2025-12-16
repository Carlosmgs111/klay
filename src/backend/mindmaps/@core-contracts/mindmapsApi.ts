import type { GenerateMindmapParams } from "../@core-contracts/dtos";

export interface MindmapsApi {
  generateMindmapFromFile(file: GenerateMindmapParams): Promise<string>;
}
