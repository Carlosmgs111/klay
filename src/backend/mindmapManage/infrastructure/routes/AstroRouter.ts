import type { APIContext } from "astro";

export class AstroRouter {
  constructor(private mindmapUseCases: any) {}
  GET = async ({ params }: APIContext) => {
    const { fileId } = params;
    console.log({ fileId });
    const text = await this.mindmapUseCases.getText(fileId);
    return new Response(text?.content, { status: 200 });
  };
  POST = async ({ params }: APIContext) => {
    const { fileId } = params;
    console.log({ fileId });
    const text = await this.mindmapUseCases.generateNewMindmap(fileId);
    console.log({ text });
    return new Response(text?.text, { status: 200 });
  };
}
