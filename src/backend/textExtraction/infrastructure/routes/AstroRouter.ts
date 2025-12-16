import type { APIContext } from "astro";
import type { TextExtractorApi } from "../../@core-contracts/textExtractorApi";

export class AstroRouter {
  constructor(private textExtractorApi: TextExtractorApi) {}
  deleteText = async ({ params }: APIContext) => {
    const { id } = params;
    console.log({ id });
    if (!id) {
      return new Response("No file id provided", { status: 400 });
    }
    const deleted = await this.textExtractorApi.removeText(id as string);
    return new Response(JSON.stringify(deleted), { status: 200 });
  };
  getIndexes = async ({ request }: APIContext) => {
    const indexes = await this.textExtractorApi.getAllIndexes();
    return new Response(JSON.stringify(indexes), { status: 200 });
  };
}
