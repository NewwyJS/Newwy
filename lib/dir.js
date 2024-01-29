import fs from "fs";
import { rootdir, outputdir } from "./config.js";

/**
 * Reset the .newwy directory
 */
export default function resetDirectory() {
  if (fs.existsSync(rootdir + "/.newwy")) {
    fs.rmSync(outputdir, { recursive: true });
  }

  if (!fs.existsSync(rootdir + "/.newwy")) {
    fs.mkdirSync(rootdir + "/.newwy", { recursive: true });
  }
}
