import fs from "fs";
import path from "path";
import { log, error } from "./console.js";
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
function watchSSRFiles(server, vite, port, comps) {
  let u = false;

  watch("./src", { recursive: true }, (event, file) => {
    if (event !== "update") return;
    if (file.endsWith(".js")) {
      if (u) return;
      u = true;

      log(`Server file changed, restart the server to see the changes.`);
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

  try {
    watchNueFiles(combined);
    watchSSRFiles(server, vite, port, comps);
  } catch (e) {
    error("Watching is not enabled on this OS");
  }
}
