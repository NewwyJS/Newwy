import fs from "fs";
import { getData } from "./ssr.js";
import { renderBody, transformBody, transformHead } from "./render.js";
import express from "express";
import { rootdir } from "./config.js";
import watcher from "./watch.js";
import { createServer } from "vite";
import { get404Data } from "./404.js";
import { log } from "./console.js";

/**
 * Start server with expressjs
 * @param {*} vite
 * @param {*} routes
 * @param {*} components
 * @returns
 */
export default async function startServer(port, comps) {
  /**
   * Start ExpressJS
   */
  const app = express();

  /**
   * Init vite
   */
  const vite = await createServer({
    root: rootdir,
    server: { middlewareMode: true },
    appType: "custom",
    configFile: rootdir + "/vite.config.js",
  });

  /**
   * Use Vite as middleware
   */
  app.use(vite.middlewares);

  /**
   * Allow static files in ./static
   */
  app.use(express.static("static"));

  /**
   * Add routes to ExpressJS
   */
  comps.routes.forEach(async (route) => {
    app.all(route.page, async (req, res, next) => {
      const url = req.url;

      const data = await getData(route.originalPath, req);

      const body = renderBody(route, comps.components, data);

      let template = fs.readFileSync(rootdir + "/src/index.html", "utf-8");

      template = transformHead(template, route.head);
      template = transformBody(template, body);

      const html = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    });
  });

  /**
   * 404 page
   */
  app.get("*", async (req, res) => {
    const data = await get404Data(req);
    const url = req.url;
    const route = comps.routes.find((obj) => obj.page === "/+404.nue");
    let html;

    if (route) {
      const body = renderBody(route, comps.components, data);

      let template = fs.readFileSync(rootdir + "/src/index.html", "utf-8");

      template = transformHead(template, route.head);
      template = transformBody(template, body);

      html = await vite.transformIndexHtml(url, template);
    } else {
      html = "Sorry, this page does not exist";
    }

    res.status(404).set({ "Content-Type": "text/html" }).end(html);
  });

  /**
   * Start server
   */
  const server = app.listen(port, () => {
    log(`Server started on port ${port}`);
  });

  /**
   * Start watching files in the src folder
   */
  watcher(server, vite, port, {
    routes: comps.routes,
    components: comps.components,
  });
}
