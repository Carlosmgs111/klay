import type { APIContext } from "astro";
import type { IFileManagerUseCases } from "../../@core-contracts/application/useCases";
import type { fileUploadParams } from "../../@core-contracts/application/useCases";

export class AstroRouter {
  private fileManagerUseCases: IFileManagerUseCases;
  constructor(fileManagerUseCases: IFileManagerUseCases) {
    this.fileManagerUseCases = fileManagerUseCases;
  }

  GET = async ({}: APIContext) => {
    const files = await this.fileManagerUseCases.getFiles();
    return new Response(JSON.stringify(files), { status: 200 });
  };

  GET_BY_ID = async ({ params }: APIContext) => {
    const { id } = params;
    const file = await this.fileManagerUseCases.getFileById(id as string);
    return new Response(JSON.stringify(file), { status: 200 });
  };

  POST = async ({ request, params }: APIContext) => {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || !id) {
      return new Response("No file uploaded", { status: 400 });
    }
    console.log({ file });
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileParams: fileUploadParams = {
      id,
      name: file.name,
      buffer,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    };
    const fileUrl = await this.fileManagerUseCases.uploadFile(fileParams);
    return new Response(fileUrl, { status: 200 });
  };

  DELETE = async ({ request, params }: APIContext) => {
    const { id } = params;
    console.log({ id });
    if (!id) {
      return new Response("No file id provided", { status: 400 });
    }
    await this.fileManagerUseCases.deleteFile(id);
    return new Response("File deleted", { status: 200 });
  };
}
