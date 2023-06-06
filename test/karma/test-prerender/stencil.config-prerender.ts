import { Config } from '../../../internal';
const { WWW_OUT_DIR } = require('../constants');

export const config: Config = {
  namespace: 'TestPrerender',
  globalStyle: 'src/global/app.css',
  tsconfig: 'tsconfig-prerender.json',
  transformAliasedImportPaths: true,
  outputTargets: [
    {
      type: 'www',
      dir: `../${WWW_OUT_DIR}`,
      baseUrl: 'https://karma.stenciljs.com/prerender',
      serviceWorker: null,
      empty: false,
      prerenderConfig: 'prerender.config.js',
    },
  ],
};
