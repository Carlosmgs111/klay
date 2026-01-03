import type { APIContext } from "astro";
import type { FilesApi } from "../../@core-contracts/api";
import type { FileUploadDTO } from "../../@core-contracts/dtos";
import type { FilesInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class AstroRouter {
  private fileManagerUseCases: FilesApi;
  constructor(
    filesApiFactory: (policy: FilesInfrastructurePolicy) => FilesApi
  ) {
    this.fileManagerUseCases = filesApiFactory({
      storage: "local-fs",
      repository: "csv",
    });
  }

  getAllFiles = async ({}: APIContext) => {
    const files = await this.fileManagerUseCases.getFiles();
    return new Response(JSON.stringify(files), { status: 200 });
  };

  getFileById = async ({ params }: APIContext) => {
    const { id } = params;
    const file = await this.fileManagerUseCases.getFileById(id as string);
    return new Response(JSON.stringify(file), { status: 200 });
  };

  uploadFile = async ({ request, params }: APIContext) => {
    const { id } = params;
    console.log({ id });
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || !id) {
      return new Response("No file uploaded", { status: 400 });
    }
    console.log({ file });
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileParams: FileUploadDTO = {
      id,
      name: file.name,
      buffer,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      url: "",
    };
    const fileUrl = await this.fileManagerUseCases.uploadFile(fileParams);
    return new Response(fileUrl.url, { status: 200 });
  };

  deleteFile = async ({ params }: APIContext) => {
    const { id } = params;
    console.log({ id });
    if (!id) {
      return new Response("No file id provided", { status: 400 });
    }
    await this.fileManagerUseCases.deleteFile(id);
    return new Response("File deleted", { status: 200 });
  };
}
