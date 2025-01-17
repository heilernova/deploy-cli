import { ICache } from "./cache.interface.js";
import { IServer } from "./server.interface.js";

export interface IConfigGlobal {
    servers: IServer[],
    cache: ICache
}