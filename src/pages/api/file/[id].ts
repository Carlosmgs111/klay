import { filesRouter } from "../../../backend/files";

export const GET = filesRouter.getFileById;
export const DELETE = filesRouter.deleteFile;
export const POST = filesRouter.uploadFile;