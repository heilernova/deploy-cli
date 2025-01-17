import chalk from "chalk";
import { Config } from "../core/config.js";
import { IApplication } from "../interfaces/application.interface.js";
import inquirer from "inquirer";
import { IServer } from "../interfaces/server.interface.js";
import { createReadStream, createWriteStream, existsSync, ReadStream } from "fs";
import { startSpinner, stopSpinner } from "../utils/spinner.js";
import archiver from "archiver";
import { basename } from "path";
import { HttpClient } from "../http/http-client.js";
import FormData from "form-data";

const generareZip = (project: IApplication) => {
    return new Promise<ReadStream>((resolve, reject) => {
        const zipName: string = "deploy.zip";
        startSpinner("comprimiendo archivos");
        try {
            if (!existsSync(project.location)){
                stopSpinner(`Directorio no encontrado: ${project.location}`, '✘');
                process.exit(0);
            }
            const ouPut = createWriteStream(zipName);
            const archive = archiver("zip");
            archive.pipe(ouPut);
            archive.directory(project.location, false);
            project.include.forEach((filename: string) => {
                archive.file(filename, { name: basename(filename) });
            });
            archive.on("error", ()   => {
                stopSpinner("Error con la compresión de los archivos", "✘");
                process.exit();
            });
            archive.finalize().then(() => {
                setTimeout(() => {
                    stopSpinner("Archivo comprimidos", "✔");
                    resolve(createReadStream(zipName));
                }, 500);
            })
        } catch (error) {
            stopSpinner("Error inesperado al momento de comprimir los archivos", "✘");
            process.exit();
        }
    })
}

export const deploy = async (config: Config) => {
    let app: IApplication;
    if (config.apps.length == 0){
        console.log(chalk.redBright("Falta agregar la configuración del proyecto"));
        process.exit(1);
    } else if (config.apps.length == 1){
        app = config.apps[0];
    } else {
        let result: { app: IApplication } = await inquirer.prompt({ name: "app", message: "Selecciones el proyecto", type: "list", choices: config.apps.map(x => { 
            return {
                name: `${x.domain} - ${x.name}`,
                value: x
            }
        })});

        app = result.app;
    }

    const server: IServer | undefined = config.servers.find(x => x.url == app.server);
    if (!server){   
        console.log(chalk.redBright("Primero se debe iniciar sesión en el servidor: " + app.server ));
        process.exit(1);
    }

    const stream = await generareZip(app);
    const http = HttpClient.server(server);
    const formData = new FormData();

    formData.append("project", app.id);
    formData.append("zip", stream);

    startSpinner("Enviado archivos al servidor");
    try {
        let res = await http.post<{ data: string }>("deploy", formData);
        if (res.data.data == "online"){
            stopSpinner("Aplicación desplegada correctamente", "✔");
        } else {
            stopSpinner(`La aplicación no se cargo correctamente, estado: ${res.data.data}`, "✘");
        }
    } catch(err) {

    }
}