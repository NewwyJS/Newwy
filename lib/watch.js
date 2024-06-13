import path from "path";
import { log, warning } from "./console.js";
import { compileFile } from "./utils.js";
import watch from "node-watch";

/**
 * Watch all Nue files
 * @param {*} arr
 */
function watchNueFiles(arr) {
  watch("./src", { recursive: true }, (event, file) => {
    if (event !== "update") return;
    
      if (file.endsWith(".nue")) {
        const fullPath = path.resolve(file);
        const object = getConnectedFile(arr, fullPath);
        if (object) {
          compileFile(file.replace('src/', ''), object.path);
        }
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
export default function watcher(comps,) {
  let combined = comps.routes.concat(comps.components);

  try {
    watchNueFiles(combined);
  } catch (e) {
    warning("Watching is not enabled on this OS");
  }
}
