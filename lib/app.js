import fs from "fs";
import { getData } from "./ssr.js";
import { renderBody, transformBody, transformHead } from "./render.js";
import { rootdir } from "./config.js";
import { get404Data } from "./404.js";
import { log } from "./console.js";
import resetDirectory from "./dir.js";
import { buildRoutes, buildComponents } from "./build.js";
import { pathToRegexp, match } from 'path-to-regexp';
import watcher from "./watch.js";

export default class App {

  /**
   * Computed components such as routes and components
   */
  comps;

  /**
   * Constructor
   */
  constructor() {
    this.comps = null;

    log('App started');
  }

  async build() {
    /**
     * Empty the .newwy directory
     */
    resetDirectory();

    /**
     * Build routes and components
     */
    const routes = await buildRoutes();
    const components = await buildComponents();

    /**
     * Set routes and components in this class
     */
    this.comps = { routes, components };
  }

  async init(app) {
    app.use(async (req, res, next) => {
      const hasFileExt = (/[.]/.exec(req.url)) ? true : false;

      if (hasFileExt || req.url.includes('@vite')) {
        return next();
      }

      for (const route of this.comps.routes) {
        const path = route.page;
        const keys = [];
        const re = pathToRegexp(path || '/', keys);
        const matchResult = re.exec(req.url);

        if (matchResult) {

          const params = {};
          keys.forEach((key, index) => {
            params[key.name] = matchResult[index + 1];
          });

          /**
       * If the route is server file only
       */
          if (route.server) {
            const data = await getData(route.originalPath, req, params);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
          }

          /**
           * Normal way of routing
           */
          const url = req.url;
          const data = await getData(route.originalPath, req, params);
          const body = renderBody(route, this.comps.components, data);
          let template = fs.readFileSync(rootdir + "/index.html", "utf-8");

          template = transformHead(template, route.head, data);
          template = transformBody(template, body);

          res.setHeader("Content-Type", "text/html");
          return res.end(template);
        }
      }

      const data = await get404Data(req);
      const route = this.comps.routes.find((obj) => obj.page === "/+404.nue");
      let html;

      if (route) {
        const body = renderBody(route, this.comps.components, data);

        let template = fs.readFileSync(rootdir + "/index.html", "utf-8");

        template = transformHead(template, route.head, data);
        template = transformBody(template, body);

        html = template
      } else {
        html = "Sorry, this page does not exist";
      }

      res.setHeader("Content-Type", "text/html");
      return res.end(html);
    });
  }

  watch(){
    watcher({
      routes: this.comps.routes,
      components: this.comps.components,
    });
  }
}
