import fs from "fs";
import path from "path";
import { log, warning } from "./console.js";
import { compileFile } from "./utils.js";
import watch from "node-watch";

/**
 * Watch all Nue files
 * @param {*} arr
 */
function watchNueFiles(arr) {
  let u = false;
  watch("./src", { recursive: true }, (event, file) => {
    if (event !== "update") return;
    if (file.endsWith(".nue")) {
      const fullPath = path.resolve(file);
      const object = getConnectedFile(arr, fullPath);
      if (object) {
        log(`Nue file changed.`);
        compileFile(file, object.path);
      } else {
        log(`Nue file added, restart the server to see the changes.`);
      }
    }
  });
}

/**
 * Watch all SSR files
 * @param {*} arr
 */
function watchSSRFiles(instance) {
  watch("./src", { recursive: true }, async (event, file) => {
    if (file.endsWith(".js")) {
      await instance.buildAll();
      await instance.setupRouter();
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
export default function watcher(server, vite, port, comps, instance) {
  let combined = comps.routes.concat(comps.components);

  try {
    watchNueFiles(combined);
    watchSSRFiles(instance);
  } catch (e) {
    warning("Watching is not enabled on this OS");
  }
}
