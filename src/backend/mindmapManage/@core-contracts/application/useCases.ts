type Text = {
    text: string;
    metadata: string;
}

export interface IMindmapUseCases {
    generateNewMindmapFromStoredFile(fileId: string): Promise<string>;
    getText(fileId: string): Promise<Text>;
    extractText(fileId: string): Promise<Text | null>;
}