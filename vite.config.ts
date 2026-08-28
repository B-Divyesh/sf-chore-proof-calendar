import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'inline-offline-shell',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = Object.values(bundle).find((item) => item.type === 'asset' && item.fileName === 'index.html');
      if (!html || html.type !== 'asset') return;
      let source = String(html.source);
      for (const [fileName, item] of Object.entries(bundle)) {
        if (item.type === 'asset' && fileName.endsWith('.css')) {
          source = source.replace(new RegExp(`<link[^>]+href="/${fileName}"[^>]*>`), `<style>${String(item.source)}</style>`);
          delete bundle[fileName];
        }
        if (item.type === 'chunk' && item.isEntry) {
          source = source.replace(new RegExp(`<script[^>]+src="/${fileName}"[^>]*></script>`), `<script type="module">${item.code}</script>`);
          delete bundle[fileName];
          if (item.map) delete bundle[`${fileName}.map`];
        }
      }
      html.source = source;
    }
  }],
  build: { target: 'es2022', sourcemap: true }
});
