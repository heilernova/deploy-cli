import { writeFileSync } from "node:fs";
import { IApplication } from "../interfaces/application.interface.js";
import { ICache } from "../interfaces/cache.interface.js";
import { IConfig } from "../interfaces/config.interface.js";
import { IServer } from "../interfaces/server.interface.js";
import { json } from "node:stream/consumers";
import { join } from "node:path";

export class Config implements IConfig {
    public readonly servers: IServer[];
    public readonly cache: ICache;
    public readonly apps: IApplication[];

    constructor(data: IConfig, private readonly _dirBase: string){
        this.servers = data.servers;
        this.cache = data.cache;
        this.apps = data.apps;
    }

    public save(): void {
        writeFileSync(join(this._dirBase, "config.json"), JSON.stringify({ servers: this.servers, cache: this.cache }, undefined, 4));
        writeFileSync(join("deploy.json"), JSON.stringify({ apps: this.apps }, undefined, 4));
    }
}