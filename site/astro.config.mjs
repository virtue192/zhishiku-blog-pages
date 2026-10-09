import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://virtue192.github.io',
  base: '/zhishiku-blog-pages/',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [preact()],
  vite: {
    plugins: [{
      name: 'life-ledger:native-esm-dev', enforce: 'post',
      configResolved(config) {
        if (process.env.LIFE_LEDGER_NATIVE_ESM !== '1') return;
        for (const environment of Object.values(config.environments)) {
          environment.optimizeDeps.noDiscovery = true;
          environment.optimizeDeps.include = [];
        }
      },
    }],
  },
});
