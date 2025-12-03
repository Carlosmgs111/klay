import type { APIContext } from "astro";
import type { IFileManagerUseCases } from "../../@core-contracts/application/useCases";

export class AstroRouter {
  private fileManagerUseCases: IFileManagerUseCases;
  constructor(fileManagerUseCases: IFileManagerUseCases) {
    this.fileManagerUseCases = fileManagerUseCases;
  }

  GET = async ({ request }: APIContext) => {
    const files = await this.fileManagerUseCases.getFiles();
    return new Response(JSON.stringify(files), { status: 200 });
  };

  POST = async ({ request }: APIContext) => {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await this.fileManagerUseCases.uploadFile(
      buffer,
      file.name
    );
    return new Response(fileUrl, { status: 200 });
  };

  DELETE = async ({ request }: APIContext) => {
    const { name } = await request.json();
    console.log({ name });
    if (!name) {
      return new Response("No file name provided", { status: 400 });
    }
    await this.fileManagerUseCases.deleteFile(name);
    return new Response("File deleted", { status: 200 });
  };
}
