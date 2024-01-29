import crypto from "crypto";
import { glob } from "glob";
import { compile, compileFile } from "nuejs-core/index.js";
import { rootdir, outputdir } from "./config.js";
import { parsePagePath } from "./utils.js";
import fs from "fs";
import { log } from "./console.js";

/**
 * Filter the route
 * @param {*} file
 * @returns
 */
async function filterRoute(file) {
  file = file.replace(rootdir, "");
  file = file.replace(/\\/g, "/");
  file = file.replace("src/routes/", "");
  file = file.replace("/+page.nue", "");
  return file;
}

/**
 * Build all available routes
 * @returns
 */
export async function buildRoutes() {
  const routeFiles = [];
  const files = await glob(rootdir + "/src/routes/**/{+page,+404}.nue");
  log(`Building routes...`);

  for (const file of files) {
    const outputFile = "n" + crypto.randomBytes(20).toString("hex") + ".js";
    const outputFilePath = outputdir + "/" + outputFile;
    const pagePath = await filterRoute(file);
    const fileContents = fs.readFileSync(file, "utf-8");
    const bareHead = fileContents.match(/<newwy:head>(.*?)<\/newwy:head>/s);
    const head = bareHead
      ? bareHead[0].replace(/<newwy:head>(.*?)<\/newwy:head>/s, "$1")
      : "";
    const body = fileContents.replace(/<newwy:head>(.*?)<\/newwy:head>/s, "");

    routeFiles.push({
      head: head,
      page: parsePagePath(pagePath),
      file: outputFile,
      path: outputFilePath,
      originalPath: file,
      originalUrl: pagePath,
    });

    const compiled = compile(body);

    fs.writeFileSync(outputFilePath, compiled);
  }

  log(`Building routes completed`);

  return routeFiles;
}

/**
 * Build all components
 * @returns
 */
export async function buildComponents() {
  const componentFiles = [];
  const files = await glob(rootdir + "/src/{,!(routes)/**/}*.nue");

  log(`Building components...`);

  for (const file of files) {
    const outputFileName = "n" + crypto.randomBytes(20).toString("hex");
    const outputFile = outputFileName + ".js";
    const outputFilePath = outputdir + "/" + outputFile;

    componentFiles.push({
      originalPath: file,
      file: outputFile,
      name: outputFileName,
      path: outputFilePath,
    });

    compileFile(file, outputFilePath);
  }

  log(`Building components completed`);

  return componentFiles;
}
