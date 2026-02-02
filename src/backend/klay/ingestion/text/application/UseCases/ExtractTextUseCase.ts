import type { TextExtractor } from "../TextExtractor";
import type { TextRepository } from "../../domain/TextRepository";
import { TextCleaner } from "../TextCleaner";
import { Text } from "../../domain/Text";

export class ExtractTextFromPDFUseCase {
  constructor(
    private textExtractor: TextExtractor,
    private textRepository: TextRepository,
  ) {}
  execute = async ({
    source,
    id,
  }: {
    source: { buffer: Buffer; id: string };
    id: string;
  }): Promise<{ status: "success" | "error"; message?: string; content?: Text }> => {
    if (!source.buffer) {
      throw new Error("File not found");
    }
    const extractedText = await this.textExtractor.extractTextFromPDF(
      source.buffer
    );
    if (!extractedText) {
      throw new Error("Text not extracted");
    }
    console.log({ extractedText });

    const cleanedText = TextCleaner.cleanAll(extractedText.content);
    const text = new Text(id, cleanedText, extractedText.metadata);
    await this.textRepository.saveText(text);
    return {
      status: "success",
      message: "Text extracted successfully",
      content: text,
    };
  };
}
