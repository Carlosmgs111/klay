import { fileManagerRouter } from "../../../backend/files";

export const GET = fileManagerRouter.getFileById;
export const DELETE = fileManagerRouter.deleteFile;
export const POST = fileManagerRouter.uploadFile;