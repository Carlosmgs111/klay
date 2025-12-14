import { type MindmapUseCases } from "../../application/UseCases";
import { type APIContext } from "astro";
import { type FileUploadDTO } from "../../../files/@core-contracts/dtos";

export class AstroRouter {
  constructor(private mindmapUseCases: MindmapUseCases) {}
  getText = async ({ params }: APIContext) => {
    const fileId = params.fileId as string;
    console.log({ fileId });
    const text = await this.mindmapUseCases.getText(fileId);
    return new Response(text?.content, { status: 200 });
  };
  getAllTexts = async () => {
    const texts = await this.mindmapUseCases.getAllTexts();
    return new Response(JSON.stringify(texts), { status: 200 });
  };
  getAllIndexes = async () => {
    const indexes = await this.mindmapUseCases.getAllIndexes();
    return new Response(JSON.stringify(indexes), { status: 200 });
  };
  removeMindmap = async ({ params }: APIContext) => {
    const fileId = params.fileId as string;
    await this.mindmapUseCases.removeMindmap(fileId);
    return new Response("OK", { status: 200 });
  };
  generateMindmapFromFile = async ({ request, params }: APIContext) => {
    const { fileId } = params;
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!file || !fileId) {
        return new Response("No file uploaded", { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileParams: FileUploadDTO = {
        id: fileId,
        name: file.name,
        buffer,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      };
      const fileUrl = await this.mindmapUseCases.uploadFileAndGenerateMindmap(
        fileParams
      );
      return new Response(fileUrl.text, { status: 200 });
    }
    const file = await this.mindmapUseCases.selectFileAndGenerateMindmap(
      fileId as string
    );
    return new Response(file.text, { status: 200 });
  };
}
