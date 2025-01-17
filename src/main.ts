#!/usr/bin/env node
import { dirname, join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Command } from "commander";
import { json } from "node:stream/consumers";
import { IConfigGlobal } from "./interfaces/config-global.interface.js";
import { IConfigWorkspace } from "./interfaces/config-workspace.interface.js";
import { IConfig } from "./interfaces/config.interface.js";
import { login } from "./commands/login.js";
import { Config } from "./core/config.js";
import { appProject } from "./commands/add-proyect.js";
import { deploy } from "./commands/deploy.js";


// Cargamos las configuraciones del sistemas
const dirBase = dirname(dirname(process.argv[1]));
if (!existsSync(join(dirBase, "config.json"))) {
    writeFileSync(join(dirBase, "config.json"), JSON.stringify({ servers: [], cache: {} } as IConfigGlobal, undefined, 4))
}

// Cargamos las configuraciones del entorno de trabajo
if (!existsSync(join("deploy.json"))){
    writeFileSync(join("deploy.json"), JSON.stringify({ apps: [] } as IConfigWorkspace, undefined, 4));
}

const configGlobal: IConfigGlobal = JSON.parse(readFileSync(join(dirBase, "config.json")).toString());
const configWorkspace: IConfigWorkspace = JSON.parse(readFileSync(join("deploy.json")).toString());

const config = new Config({
    servers: configGlobal.servers,
    cache: configGlobal.cache,
    apps: configWorkspace.apps,
}, dirBase);

const program = new Command();
program.command("login").action(() => login(config));
program.command("add").action(() => appProject(config));
program.action(() => deploy(config));

program.parse(process.argv);