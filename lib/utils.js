import { compile } from "nuejs-core/index.js";
import fs from "fs";
import { rootdir } from "./config.js";

/**
 * Function to parse the page path
 * @param {string} url
 * @returns
 */
export function parsePagePath(url) {
  return url.replace(/\[|\]/g, function (match) {
    if (match === "[") return ":";
    else if (match === "]") return "";
  });
}

/**
 * Get the server file of a page
 * @param {*} nuePath
 * @returns
 */
export function getServerFile(nuePath) {
  return nuePath.replace("+page.nue", "+server.js");
}

/**
 * Get the server file of the 404 page
 * @param {*} nuePath
 * @returns
 */
export function get404ServerFile(nuePath) {
  return nuePath.replace("+404.nue", "+404.js");
}

/**
 * Convert object
 * @param {*} obj
 * @returns
 */
export function convert(obj) {
  let ret = "{";

  for (let k in obj) {
    let v = obj[k];

    if (typeof v === "function") {
      v = v.toString();
    } else if (v instanceof Array) {
      v = JSON.stringify(v);
    } else if (typeof v === "object") {
      v = convert(v);
    } else {
      v = `"${v}"`;
    }

    ret += `\n  ${k}: ${v},`;
  }

  ret += "\n}";

  return ret;
}

/**
 * Recompile file with changed contents
 * @param {*} file
 * @param {*} target
 */
export function compileFile(file, target) {
  const filename = `./src/${file}`;
  const fileContents = fs.readFileSync(filename, "utf-8");
  const body = fileContents
    .replace(/<newwy:head>(.*?)<\/newwy:head>/s, "")
    .replace(/<style>(.*?)<\/style>/s);

  const compiled = compile(body);

  fs.writeFileSync(target, compiled);
}
