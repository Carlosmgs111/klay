export interface CleaningOptions {
    trimLineWhitespace?: boolean;
    removeExtraSpaces?: boolean;
    removeBlankLines?: boolean;
    removeTabs?: boolean;
    removeAllLineBreaks?: boolean;
  }
  
  export class TextCleaner {
    static clean(text: string, options: CleaningOptions = {}): string {
      let result = text;
  
      if (options.trimLineWhitespace) {
        result = this.trimLineWhitespace(result);
      }
      if (options.removeTabs) {
        result = this.removeTabs(result);
      }
      if (options.removeExtraSpaces) {
        result = this.removeExtraSpaces(result);
      }
      if (options.removeBlankLines) {
        result = this.removeBlankLines(result);
      }
      if (options.removeAllLineBreaks) {
        result = this.removeAllLineBreaks(result);
      }
  
      return result;
    }
    private static trimLineWhitespace(text: string): string {
      return text
        .split("\n")
        .map((line) => line.trim())
        .join("\n");
    }
    private static removeExtraSpaces(text: string): string {
      return text.replace(/ {2,}/g, " ");
    }
    private static removeBlankLines(text: string): string {
      return text
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .join("\n");
    }
    private static removeTabs(text: string): string {
      return text.replace(/\t/g, " ");
    }
    private static removeAllLineBreaks(text: string): string {
      return text.replace(/\r?\n/g, " ");
    }
    static cleanAll(text: string): string {
      return this.clean(text, {
        trimLineWhitespace: true,
        removeExtraSpaces: true,
        removeBlankLines: true,
        removeTabs: true,
        removeAllLineBreaks: false,
      });
    }
  }
  