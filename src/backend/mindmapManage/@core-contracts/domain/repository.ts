type Text = {
    content: string;
    fileId: string;
}

export interface IRepository {
    saveText(index:string,text: string): Promise<void>;
    getText(index:string): Promise<Text>;
}