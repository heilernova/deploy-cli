import chalk from "chalk";
import inquirer from "inquirer";
import { Config } from "../core/config.js";
import { IServer } from "../interfaces/server.interface.js";
import { HttpClient } from "../http/http-client.js";
import { startSpinner, stopSpinner } from "../utils/spinner.js";
import { AxiosResponse } from "axios";

export const appProject = async (config: Config) => {
    let server: IServer;
    if (config.servers.length == 0){
        console.log(chalk.redBright("Falta iniciar sesión"));
        process.exit(1);
    } else if (config.servers.length == 1){
        server = config.servers[0];
    } else {
        let result: { server: IServer } = await inquirer.prompt({ name: "server", message: "Seleccione el servidor", type: "list", choices: config.servers.map(x => { 
            return {
                name: x.url,
                value: x
            }
        })});
        server = result.server;
    }

    const http = HttpClient.server(server);
    startSpinner("Cargando aplicaciones del servidor");
    let response: AxiosResponse<{
        data: {
            id: string;
            domain: string;
            name: string;
        }[];
    }, any>
    try {
        response =  await http.get<{ data: { id: string, domain: string, name: string }[] }>("projects");
    } catch (error: any) {
        stopSpinner(`Error con el servidor: ${error.data.message}`, "✘");
        process.exit(1);
    }
    let apps = response.data.data;
    stopSpinner("Aplicaciones cargadas", "✔");

    const app: any = (await inquirer.prompt({
        name: "app",
        message: "Seleccione la aplicación",
        type: "list",
        choices: apps.map(x => ({ name: `${x.name}  - ${x.domain}`, value: x }))
    })).app;
    const index = config.apps.findIndex(x => x.id == app.id);
    if (index > -1){
        config.apps[index].domain = app.domain;
        config.apps[index].name = app.name;
        console.log(chalk.cyanBright("Se actualizo la información de la aplicación en el deploy.json"));
        config.save();
        process.exit(1);
    }

    let res: {
        location: string,
        include: string,
    } = await inquirer.prompt([
        {
            name: "location",
            message: "Ubicación del código a desplegar",
            type: "input",
        },
        {
            name: "include",
            message: "Archivos a incluir",
            type: "input"
        }
    ]);



    config.apps.push({
        id: app.id,
        server: server.url,
        domain: app.domain,
        name: app.name,
        location: res.location,
        include: res.include.split(",").map(x => x.trim()).filter(x => x.length > 0)
    });

    config.save();
}