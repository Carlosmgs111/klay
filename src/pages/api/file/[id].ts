import { fileManagerRouter } from "../../../backend/fileManage";

export const GET = fileManagerRouter.getFileById;
export const DELETE = fileManagerRouter.deleteFile;
export const POST = fileManagerRouter.uploadFile;