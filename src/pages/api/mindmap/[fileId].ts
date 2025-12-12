import { mindmapRouter } from "../../../backend/mindmapManage";

export const GET = mindmapRouter.getText;
export const POST = mindmapRouter.generateMindmapFromFile;
export const DELETE = mindmapRouter.removeMindmap;

