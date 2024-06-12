import App from "./app.js";
import { fileURLToPath, URL } from 'url';

const newwy = () => {
    return {
      name: 'newwy',

      config: () => ({
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            },
            extensions: [
                '.js',
                '.json',
                '.mjs',
                '.ts',
            ],
        },
        base: './',
      }),
  
      async configureServer(server) {
        const app = new App;
        await app.build();
        await app.init(server.middlewares);
        app.watch();
      },
    }
  }

  export default newwy;