import { getServerFile } from "./utils.js";
import fs from "fs";
import { rootdir } from "./config.js";

/**
 * Get SSR data
 * @param {string} path
 * @param {object} req
 * @returns
 */
export async function getData(path, req) {
  const serverFilePath = getServerFile(path);

  if (!fs.existsSync(serverFilePath)) return {};

  const data = await import("file://" + serverFilePath).then(
    async (module) => {
      if (req.method === "POST" && typeof module.post === "function") {
        return await module.post(req);
      }

      if (req.method === "GET" && typeof module.get === "function") {
        return await module.get(req);
      }

      if (req.method === "PUT" && typeof module.put === "function") {
        return await module.put(req);
      }

      if (req.method === "DELETE" && typeof module.delete === "function") {
        return await module.delete(req);
      }
    }
  );

  return data || {};
}
