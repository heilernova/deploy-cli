import { IApplication } from "./application.interface.js";
import { ICache } from "./cache.interface.js";
import { IServer } from "./server.interface.js";

export interface IConfig {
    servers: IServer[],
    cache: ICache,
    apps: IApplication[]
}