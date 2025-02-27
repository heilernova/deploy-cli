import os from "node:os";
import { Config } from "../core/config.js";
import { input, password } from "@inquirer/prompts";
import { startSpinner, stopSpinner } from "../utils/spinner.js";
import { HttpClient } from "../http/http-client.js";
// import { input, password } from '@inquirer/prompts';
// import { startSpinner, stopSpinner } from "../utils/spinner.js";
// import { HttpClient } from "../http/http-client.js";

export const login = async (config: Config) => {
    const data = {
        server: await input({ message: "Server", default: config.cache.login?.server }),
        username: await input({ message: "Username", default: config.cache.login?.username }),
        password: await password({ message: "Password", mask: "*" }),
    }

    config.cache.login = {
        server: data.server,
        username: data.username
    };

    config.save();
    
    startSpinner("Validando credenciales");
    const httpClient = new HttpClient();
    try {
        const hostname = os.hostname();
        const res = await httpClient.post(`${data.server}/api/sign-in`, { username: data.username, password: data.password }, { "X-App-Hostname": hostname });
        const index = config.servers.findIndex(x => x.url == data.server);
        if (index > -1){
            config.servers[index] = {
                url: data.server,
                username: data.username,
                token: res.data.data.token,
            }
        } else {
            config.servers.push({
                url: data.server,
                username: data.username,
                token: res.data.data.token,
            })
        }
        config.save();
        stopSpinner("Validación correcta.", "✔");
    } catch (err: any) {
        let message = "Error inesperado";
        if (err.status == 404) message = "La ruta es incorrecta";
        if (err.status == 400) message = `Credenciales incorrectas: ${err.data.message}`;
        if (err.status == 500) message = "Error con el servidor";
        stopSpinner(message, "✘");
    }
}
