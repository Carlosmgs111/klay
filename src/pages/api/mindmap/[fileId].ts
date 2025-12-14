import { mindmapRouter } from "../../../backend/mindmaps";

export const GET = mindmapRouter.getText;
export const POST = mindmapRouter.generateMindmapFromFile;
export const DELETE = mindmapRouter.removeMindmap;

