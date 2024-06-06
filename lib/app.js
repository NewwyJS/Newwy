import fs from "fs";
import { getData } from "./ssr.js";
import { renderBody, transformBody, transformHead } from "./render.js";
import express from "express";
import { rootdir } from "./config.js";
import watcher from "./watch.js";
import { createServer } from "vite";
import { get404Data } from "./404.js";
import { log } from "./console.js";
import resetDirectory from "./dir.js";
import { buildRoutes, buildComponents } from "./build.js";

export default class App {
  /**
   * Will contain the express app
   */
  app;

  /**
   * Will contain the Vite instance
   */
  vite;

  /**
   * Port
   */
  port;

  /**
   * Computed components such as routes and components
   */
  comps;

  /**
   * Instance
   */
  instance;

  /**
   * Constructor
   */
  constructor() {
    this.app = express();
    this.vite = null;
    this.port = process.env.PORT || 5173;
    this.comps = null;
    this.instance = this;
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

  /**
   * Initialize
   */
  async initialize() {
    /**
     * Build routes and components
     */
    await this.build();

    /**
     * Create Vite instance
     */
    this.vite = await createServer({
      root: rootdir,
      server: { middlewareMode: true },
      appType: "custom",
    });

    /**
     * Use Vite as middleware
     */
    this.app.use(this.vite.middlewares);

    /**
     * Allow static files
     */
    this.app.use(express.static("static"));

    /**
     * Add all routes to app
     */
    await this.createRoutes();
  }

  /**
   * Create all routes
   */
  async createRoutes() {
    this.comps.routes.forEach(async (route) => {
      this.app.all(route.page, async (req, res, next) => {
        /**
         * If the route is server file only
         */
        if (route.server) {
          const data = await getData(route.originalPath, req);
          res
            .status(200)
            .set({ "Content-Type": "application/json" })
            .end(JSON.stringify(data));
          return;
        }

        /**
         * Normal way of routing
         */
        const url = req.url;
        const data = await getData(route.originalPath, req);
        const body = renderBody(route, this.comps.components, data);
        let template = fs.readFileSync(rootdir + "/index.html", "utf-8");

        template = transformHead(template, route.head, data);
        template = transformBody(template, body);

        const html = await this.vite.transformIndexHtml(url, template);

        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      });
    });

    /**
     * 404 page
     */
    this.app.get("*", async (req, res) => {
      const data = await get404Data(req);
      const url = req.url;
      const route = this.comps.routes.find((obj) => obj.page === "/+404.nue");
      let html;

      if (route) {
        const body = renderBody(route, this.comps.components, data);

        let template = fs.readFileSync(rootdir + "/index.html", "utf-8");

        template = transformHead(template, route.head, data);
        template = transformBody(template, body);

        html = await this.vite.transformIndexHtml(url, template);
      } else {
        html = "Sorry, this page does not exist";
      }

      res.status(404).set({ "Content-Type": "text/html" }).end(html);
    });
  }

  /**
   * Add custom middleware
   * @param {*} middleware
   */
  async middleware(middleware) {
    this.app.use(middleware);
  }

  /**
   * Start the server
   * @returns
   */
  async start() {
    /**
     * Init
     */
    await this.initialize();

    /**
     * Start server
     */
    const server = this.app.listen(this.port, () => {
      log(`Server started on port ${this.port}`);
    });

    /**
     * Watch route and component files
     */
    watcher(server, this.vite, this.port, {
      routes: this.comps.routes,
      components: this.comps.components,
    });

    /**
     * Return server instance
     */
    return server;
  }
}
