import type { FilesApi } from "../../files/@core-contracts/api";
import type { TextExtractorApi } from "../../text-extraction/@core-contracts/textExtractorApi";
import type { AIApi } from "../../agents/@core-contracts/aiApi";
import type { GenerateMindmapParams } from "../@core-contracts/dtos";

const markmapExample = `
# Title

## Explanation
- This is a large paragraph dedicated to explain something long and big, use this to add precise explanations.

## Links
- [Website](https://markmap.js.org/)
- [GitHub](https://github.com/gera2ld/markmap)

## Related Projects

- [coc-markmap](https://github.com/gera2ld/coc-markmap) for Neovim
- [markmap-vscode](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode) for VSCode
- [eaf-markmap](https://github.com/emacs-eaf/eaf-markmap) for Emacs

## Features

### Lists

- **strong** ~~del~~ *italic* ==highlight==
- \`inline code\`
- [x] checkbox
- Katex: $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$ <!-- markmap: fold -->
  - [More Katex Examples](#?d=gist:af76a4c245b302206b16aec503dbe07b:katex.md)
- Now we can wrap very very very very long text based on \`maxWidth\` option

### Blocks

\`\`\`js
console.log('hello, JavaScript')
\`\`\`

| Products | Price |
|-|-|
| Apple | 4 |
| Banana | 2 |

![](/favicon.png)`;

export class UseCases {
  constructor(
    private filesApi: FilesApi,
    private textExtractorApi: TextExtractorApi,
    private aiApi: AIApi
  ) {}
  uploadFileAndGenerateMindmap = async ({
    id,
    file,
  }: GenerateMindmapParams) => {
    const { buffer } = file;
    this.filesApi.uploadFile(file);
    const text = await this.textExtractorApi.extractTextFromPDF({
      source: { buffer, id },
      id,
    });
    if (!text) {
      throw new Error("Text not extracted");
    }
    return text;
  };
  selectFileAndGenerateMindmap = async (id: string, fileId: string) => {
    const { buffer } = await this.filesApi.getFileById(fileId);
    const text = await this.textExtractorApi.extractTextFromPDF({
      source: { buffer, id: fileId },
      id,
    });
    if (!text) {
      throw new Error("Text not extracted");
    }
    return text.text;
  };
  async *selectFileAndGenerateMindmapStream(id: string, fileId: string) {
    const { buffer } = await this.filesApi.getFileById(fileId);
    const text = await this.textExtractorApi.extractTextFromPDF({
      source: { buffer, id: fileId },
      id,
    });
    if (!text) {
      throw new Error("Text not extracted");
    }
    const systemPrompt = `
  - Eres un experto analista que identifica y extrae la informacion mas relevante 
  e importante y la condensa en formato MARKDOWN y MINDMAP.
  - Sigue el siguiente ejemplo escrito en MARKDOWN para saber como estructurar la respuesta, ten en
  cuenta las anotaciones, asi sabras que hace cada conjunto de caracteres:
  <template>
  ${markmapExample}
  </template>
  - Devuelve solo el mindmap en formato MARKDOWN.
  - La informacion esta dentro de las etiquetas <data> y </data>.
  `;
    const userPrompt = `
    <data>
    ${text.text}
    </data>
    `;
    for await (const chunk of this.aiApi.streamCompletion("", {
      systemPrompt,
      userPrompt,
    })) {
      yield chunk;
    }
  }
  async *uploadFileAndGenerateMindmapStream(
    id: string,
    file: GenerateMindmapParams,
    query?: {
      message: string;
      style: string;
    },){
    
      

  }
  generateMindmapFromText = async (id: string, text: string) => {
    if (!text) {
      throw new Error("Text not found");
    }
    return text;
  };
}
