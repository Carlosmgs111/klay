import type { APIContext } from "astro";
import type { FilesApi } from "../../@core-contracts/api";
import type { FileUploadDTO } from "../../@core-contracts/dtos";
import type { FilesInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class AstroRouter {
  private fileManagerUseCasesPromise: Promise<FilesApi>;
  constructor(
    filesApiFactory: (policy: FilesInfrastructurePolicy) => Promise<FilesApi>
  ) {
    this.fileManagerUseCasesPromise = filesApiFactory({
      storage: "local-fs",
      repository: "csv",
    });
  }

  getAllFiles = async ({}: APIContext) => {
    const fileManagerUseCases = await this.fileManagerUseCasesPromise;
    const files = await fileManagerUseCases.getFiles();
    return new Response(JSON.stringify(files), { status: 200 });
  };

  getFileById = async ({ params }: APIContext) => {
    const { id } = params;
    const fileManagerUseCases = await this.fileManagerUseCasesPromise;
    const file = await fileManagerUseCases.getFileById(id as string);
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
    const fileManagerUseCases = await this.fileManagerUseCasesPromise;
    const fileUrl = await fileManagerUseCases.uploadFile(fileParams);
    return new Response(fileUrl.url, { status: 200 });
  };

  deleteFile = async ({ params }: APIContext) => {
    const { id } = params;
    console.log({ id });
    if (!id) {
      return new Response("No file id provided", { status: 400 });
    }
    const fileManagerUseCases = await this.fileManagerUseCasesPromise;
    await fileManagerUseCases.deleteFile(id);
    return new Response("File deleted", { status: 200 });
  };
}
