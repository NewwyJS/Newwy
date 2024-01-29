import { get404ServerFile } from "./utils.js";
import fs from "fs";
import { rootdir } from "./config.js";

/**
 * Get 404 page data
 * @param {string} path
 * @param {object} req
 * @returns
 */
export async function get404Data(req) {
  const path = rootdir + "/src/routes/+404.nue";
  const serverFilePath = get404ServerFile(path);

  if (!fs.existsSync(serverFilePath)) return {};

  const data = await import("file://" + serverFilePath).then(async (module) => {
    if (req.method === "GET" && typeof module.get === "function") {
      return await module.get(req);
    }
  });

  return data ?? {};
}
