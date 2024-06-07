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
  file = file.replace("/+server.js", "");
  return file;
}

/**
 * Build all available routes
 * @returns
 */
export async function buildRoutes() {
  const routeFiles = [];
  const files = await glob(
    rootdir + "/src/routes/**/{+page.nue,+404.nue,+server.js}"
  );

  /**
   * Parse all Nue file routes
   */
  for (const file of files) {
    if (!file.endsWith(".nue")) continue;

    const outputFile = "n" + crypto.randomBytes(20).toString("hex") + ".js";
    const outputFilePath = outputdir + "/" + outputFile;
    const pagePath = await filterRoute(file);
    const fileContents = fs.readFileSync(file, "utf-8");

    const bareHead = fileContents.match(/<newwy:head>(.*?)<\/newwy:head>/s);
    const head = bareHead
      ? bareHead[0].replace(/<newwy:head>(.*?)<\/newwy:head>/s, "$1")
      : "";

    const body = fileContents
      .replace(/<newwy:head>(.*?)<\/newwy:head>/s, "")
      .replace(/<style>(.*?)<\/style>/s);

    routeFiles.push({
      head: head,
      page: parsePagePath(pagePath),
      file: outputFile,
      path: outputFilePath,
      originalPath: file,
      originalUrl: pagePath,
      server: false,
    });

    const compiled = compile(body);

    fs.writeFileSync(outputFilePath, compiled);
  }

  /**
   * Parse all server-/api-only routes
   */
  for (const file of files) {
    if (!file.endsWith(".js")) continue;

    const nueFile = file.replace("+server.js", "+page.nue");
    const routeFile = routeFiles.find(
      (route) => route.originalPath === nueFile
    );

    if (routeFile) continue; // Continue if route is found

    const pagePath = await filterRoute(file);

    routeFiles.push({
      page: parsePagePath(pagePath),
      originalPath: file,
      originalUrl: pagePath,
      server: true,
    });
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


  for (const file of files) {
    const outputFileName = "n" + crypto.randomBytes(20).toString("hex");
    const outputFile = outputFileName + ".js";
    const outputFilePath = outputdir + "/" + outputFile;
    const fileContents = fs.readFileSync(file, "utf-8");
    const body = fileContents.replace(/<style>(.*?)<\/style>/s);
    const compiled = compile(body);

    componentFiles.push({
      originalPath: file,
      file: outputFile,
      name: outputFileName,
      path: outputFilePath,
    });

    fs.writeFileSync(outputFilePath, compiled);
  }

  log(`Building components completed`);

  return componentFiles;
}
