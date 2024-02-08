import { load } from "js-toml";
import { rootdir } from "./config.js";
import fs from "fs";

/**
 * Parse the style and add variables
 * @param {*} style
 * @returns
 */
export function parseStyle(style) {
  const file = rootdir + "/style.config.toml";
  if (!fs.existsSync(file)) return style;

  const config = fs.readFileSync(file, "utf-8");
  const toml = load(config);
  const parsed = replaceVariables(style, toml);
  const rootVars = convertToCSSVariables(toml);

  return { parsed, rootVars };
}

/**
 * Replaces the variables in the styling with config values
 * @param {*} str
 * @param {*} variables
 * @returns
 */
function replaceVariables(str, variables) {
  return str.replace(/\$[^\s;]+/g, function (match) {
    var variablePath = match.substring(1).split(".");
    var value = variables;
    for (var i = 0; i < variablePath.length; i++) {
      if (value.hasOwnProperty(variablePath[i])) {
        value = value[variablePath[i]];
      } else {
        return match;
      }
    }
    return value;
  });
}

/**
 * Convert config options to css variables
 * @param {*} variableValues
 * @returns
 */
function convertToCSSVariables(variableValues) {
  let cssVariables = ":root { ";
  for (let key in variableValues) {
    if (typeof variableValues[key] === "object") {
      for (let nestedKey in variableValues[key]) {
        cssVariables += `--${key}-${nestedKey}: ${variableValues[key][nestedKey]}; `;
      }
    } else {
      cssVariables += `--${key}: ${variableValues[key]}; `;
    }
  }
  cssVariables += "} ";
  return cssVariables;
}
