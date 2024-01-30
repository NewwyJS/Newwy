import { convert } from "./utils.js";
import { render } from "nuejs-core/index.js";

/**
 * Transform the head
 * @param {*} template
 * @param {*} head
 * @returns
 */
export function transformHead(template, head, data) {
  const rendered = render(`<newwy:head>${head}</newwy:head>`, data, []);
  const parsed = rendered.replace(
    /<nue-island island="newwy:head">(.*?)<\/nue-island>/s,
    "$1"
  );
  return template.replace(" <!-- newwy:head -->", parsed);
}

/**
 * Transform the body
 * @param {*} template
 * @param {*} body
 * @returns
 */
export function transformBody(template, body) {
  return template.replace(" <!-- newwy:body -->", body);
}

/**
 * Mount the Nue app to the root element
 * @param {*} route
 * @param {*} deps
 * @param {*} data
 * @returns
 */
export function renderBody(route, deps, data) {
  let depsScripts = ``;
  let depsArray = ``;

  depsArray += `[`;

  deps.forEach((dep, key) => {
    if (key === deps.length - 1) {
      depsArray += `...${dep.name}`;
    } else {
      depsArray += `...${dep.name},`;
    }

    depsScripts += `import { lib as ${dep.name} } from '/.newwy/${dep.file}';`;
  });

  depsArray += `]`;

  const html = `
  <script type="module">
    import createApp from '/node_modules/nuejs-core/src/browser/nue.js';
    import Page from '/.newwy/${route.file}';

    ${depsScripts};

    const data = ${convert(data)};

    const app = createApp(Page, data, ${depsArray});
    const root = document.querySelector('#root');

    app.mount(root);
  </script>
  <script type="module">
    import "/node_modules/newwy/lib/browser/preloader.js";
  </script>`;

  return html;
}
