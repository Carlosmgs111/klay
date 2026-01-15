import type { PromptRepository } from "../../@core-contracts/repositories";
import type { PromptTemplateDTO } from "../../@core-contracts/dtos";
import { getDB } from "../../../shared/config/repositories";
import { Level } from "level";

export class LocalLevelPromptRepository implements PromptRepository {
    private db: Level | null = null;
    private dbInitialized: boolean = false;

    constructor() {
    }

    private async ensureDB() {
        if (!this.dbInitialized) {
            this.db = await getDB("prompts");
            this.dbInitialized = true;
        }
    }

    async getPromptById(id: string): Promise<string> {
        await this.ensureDB();
        return this.db?.get(id).then((data: any) => JSON.parse(data));
    }

    async savePromptById(id: string, prompt: PromptTemplateDTO): Promise<void> {
        await this.ensureDB();
        return this.db?.put(id, JSON.stringify(prompt));
    }
}