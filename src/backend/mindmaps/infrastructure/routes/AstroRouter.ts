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

  generateMindmapFromFileStream = async ({ request, params }: APIContext) => {
    const { id } = params;
    const contentType = request.headers.get("content-type");
    const mindmapUseCases = this.mindmapUseCases;
    if (contentType?.includes("multipart/form-data")) {
      try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const fileId = formData.get("id") as string;
        const query = formData.get("query") as string;
        const style = formData.get("style") as string;
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
        console.log(fileParams, fileId, query, style);
        const stream = new ReadableStream({
          async start(controller) {
            try {
              const encoder = new TextEncoder();
              for await (const chunk of mindmapUseCases.uploadFileAndGenerateMindmapStream(
                id as string,
                fileParams,
                {
                  message: query,
                  style,
                }
              )) {
                controller.enqueue(encoder.encode(chunk));
              }
              controller.close();
            } catch (error) {
              console.log(error);
              controller.error(error);
            }
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control",
          },
        });
      } catch (error) {
        console.log(error);
        return new Response("Error processing file", { status: 500 });
      }
    }
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          for await (const chunk of mindmapUseCases.selectFileAndGenerateMindmapStream(
            id as string,
            (await request.json()).fileId as string
          )) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.log(error);
          controller.error(error);
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  };
}
