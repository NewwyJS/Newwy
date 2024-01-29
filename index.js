import { buildRoutes, buildComponents } from "./lib/build.js";
import resetDirectory from "./lib/dir.js";
import startServer from "./lib/server.js";

const port = process.env.PORT || 5173;

export default async function createApp() {
  /**
   * Reset .newwy directory to empty
   */
  resetDirectory();

  /**
   * Build routes and components
   */
  const routes = await buildRoutes();
  const components = await buildComponents();

  /**
   * Start server
   */
  startServer(port, { routes, components });
}
