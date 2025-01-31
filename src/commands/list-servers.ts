import { Config } from "../core/config.js";

export const listServers = async (config: Config) => {
    if (config.servers.length == 0){
        console.log("No hay servidores registrados");
        return;
    }
    console.table(config.servers, ['url', 'username']);
}