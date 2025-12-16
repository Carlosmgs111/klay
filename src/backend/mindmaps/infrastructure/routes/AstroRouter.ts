import { type UseCases } from "../../application/UseCases";
import { type APIContext } from "astro";
import { type GenerateMindmapParams } from "../../@core-contracts/dtos";

export class AstroRouter {
  constructor(private mindmapUseCases: UseCases) {}
  generateMindmapFromFile = async ({ request, params }: APIContext) => {
    const { id } = params;
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const fileId = formData.get("id") as string;
      if (!file || !fileId) {
        return new Response("No file uploaded", { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileParams: GenerateMindmapParams = {
        id: fileId,
        file: {
          id: fileId,
          name: file.name,
          buffer,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        },
      };
      const fileUrl = await this.mindmapUseCases.uploadFileAndGenerateMindmap(
        fileParams
      );
      return new Response(fileUrl.text, { status: 200 });
    }
    const body = await request.json();
    const fileId = body.fileId;
    if (!fileId) {
      return new Response("No file id provided", { status: 400 });
    }
    const file = await this.mindmapUseCases.selectFileAndGenerateMindmap(
      id as string,
      fileId as string
    );
    return new Response(file, { status: 200 });
  };
}
