import { Config } from "../core/config.js";
import { select } from "@inquirer/prompts";

export const deleteServer = async (config: Config) => {
    
    const result = await select({ message: 'Seleccione el servidor a eliminar', choices: config.servers.map((server, index) => ({ name: `${index + 1}. ${server.url} - ${server.username}`, value: index })) });
    if (result >= 0) {
        config.servers.splice(result, 1);
        config.save();
        console.log('Servidores eliminados');
    }
}