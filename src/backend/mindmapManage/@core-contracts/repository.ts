import type { TextDTO } from "./dtos";

export interface Repository {
    saveText(index:string,text: string): Promise<void>;
    getText(index:string): Promise<TextDTO>;
}