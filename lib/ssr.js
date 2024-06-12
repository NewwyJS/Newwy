import moment from "moment";
import { getServerFile } from "./utils.js";
import fs from "fs";

/**
 * Get SSR data
 * @param {string} path
 * @param {object} req
 * @returns
 */
export async function getData(path, req, params) {
  const serverFilePath = getServerFile(path);

  if (!fs.existsSync(serverFilePath)) return {};

  const data = await import("file://" + serverFilePath + '?v=' + moment().unix()).then(
    async (module) => {
      if (req.method === "POST" && typeof module.post === "function") {
        return await module.post({request: req, params});
      }

      if (req.method === "GET" && typeof module.get === "function") {
        return await module.get({request: req, params});
      }

      if (req.method === "PUT" && typeof module.put === "function") {
        return await module.put({request: req, params});
      }

      if (req.method === "DELETE" && typeof module.delete === "function") {
        return await module.del({request: req, params});
      }
    }
  );

  return data || {};
}
