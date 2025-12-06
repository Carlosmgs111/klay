import { type IMindmapUseCases } from "../../@core-contracts/application/useCases";
import { type APIContext } from "astro";
import { type fileUploadParams } from "../../../fileManage/@core-contracts/application/useCases";

export class AstroRouter {
  constructor(private mindmapUseCases: any) {}
  getText = async ({ params }: APIContext) => {
    const { fileId } = params;
    console.log({ fileId });
    const text = await this.mindmapUseCases.getText(fileId);
    return new Response(text?.content, { status: 200 });
  };
  uploadFileAndGenerateMindmap = async ({ request, params }: APIContext) => {
    const { fileId } = params;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || !fileId) {
      return new Response("No file uploaded", { status: 400 });
    }
    console.log({ file });
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileParams: fileUploadParams = {
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
    console.log({ fileUrl });
    return new Response(fileUrl, { status: 200 });
  };
  generateNewMindmapFromStoredFile = async ({ params }: APIContext) => {
    const { fileId } = params;
    console.log({ fileId });
    const text = await this.mindmapUseCases.generateNewMindmapFromStoredFile(
      fileId
    );
    console.log({ text });
    return new Response(text?.text, { status: 200 });
  };
}
