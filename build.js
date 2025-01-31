import { createWriteStream } from "node:fs";
import archiver from "archiver";

const zipName = "nv-deploy-cli.tar";
const ouPut = createWriteStream(zipName);
const archive = archiver("tar");

archive.pipe(ouPut);
archive.directory("./build", "lib/lib");
archive.file("./package.json");
archive.file("./README.md");

archive.on("error", () => {
    console.log("Error al generar el archivo tar");
});

archive.finalize().then(() => {
    console.log("Archivo generado");
})