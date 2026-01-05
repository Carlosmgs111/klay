import type { APIContext } from "astro";
import type { TextExtractorApi } from "../../@core-contracts/api";
import type { TextExtractionInfrastructurePolicy } from "../../@core-contracts/infrastructurePolicies";

export class AstroRouter {
  private textExtractorApiPromise: Promise<TextExtractorApi>;
  constructor(
    textExtractorApiFactory: (policy: TextExtractionInfrastructurePolicy) => Promise<TextExtractorApi>
  ) {
    this.textExtractorApiPromise = textExtractorApiFactory({
      extractor: "pdf",
      repository: "local-level",
    });
  }
  deleteText = async ({ params }: APIContext) => {
    const { id } = params;
    console.log({ id });
    if (!id) {
      return new Response("No file id provided", { status: 400 });
    }
    const textExtractorApi = await this.textExtractorApiPromise;
    const deleted = await textExtractorApi.removeText(id as string);
    return new Response(JSON.stringify(deleted), { status: 200 });
  };
  getIndexes = async ({ request }: APIContext) => {
    const textExtractorApi = await this.textExtractorApiPromise;
    const indexes = await textExtractorApi.getAllIndexes();
    return new Response(JSON.stringify(indexes), { status: 200 });
  };
}
