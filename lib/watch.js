import fs from "fs";
import path from "path";
import { compile } from "nuejs-core/index.js";
import startServer from "./server.js";
import { log } from "./console.js";

/**
 * Recompile file with changed contents
 * @param {*} file
 * @param {*} target
 */
function compileFile(file, target) {
  const filename = "./src/" + file;
  const contents = fs.readFileSync(filename, "utf-8");
  const body = contents.replace(/<newwy:head>(.*?)<\/newwy:head>/s, "");
  const compiled = compile(body);
  fs.writeFileSync(target, compiled);
}

/**
 * Watch all Nue files
 * @param {*} arr
 */
function watchNueFiles(arr) {
  let u = false;
  fs.watch("./src", { recursive: true }, (event, file) => {
    if (event !== "change") return;
    if (file.endsWith(".nue")) {
      const fullPath = path.resolve("src/" + file);
      const object = getConnectedFile(arr, fullPath);
      if (object) {
        log(`Nue file changed`);
        compileFile(file, object.path);
      } else {
        log(`Nue file added, restart the server to see the changes`);
      }
    }
  });
}

/**
 * Watch all SSR files
 * @param {*} arr
 */
function watchSSRFiles(server, vite, port, comps) {
  let u = false;

  fs.watch("./src", { recursive: true }, (event, file) => {
    if (event !== "change") return;
    if (file.endsWith(".js")) {
      if (u) return;
      u = true;

      log(`Server file changed. Restarted on port ${port}`);

      server.close();
      vite.close();

      startServer(port, comps);
    }
  });
}

/**
 * Get the connected file
 * @param {*} arr
 * @param {*} location
 * @returns
 */
function getConnectedFile(arr, location) {
  return arr.find((obj) => {
    return path.resolve(obj.originalPath) === location;
  });
}

/**
 * Watcher
 * @param {*} options
 */
export default function watcher(server, vite, port, comps) {
  let combined = comps.routes.concat(comps.components);

//   watchNueFiles(combined);
//   watchSSRFiles(server, vite, port, comps);
}
