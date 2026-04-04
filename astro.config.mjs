// astro.config.mjs
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  site: 'https://szres.github.io',
  base: '/ifs-gacha-system',
  output: 'static',
  integrations: [
    svelte(),
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'IFS Gacha System',
        short_name: 'IFS Gacha',
        description: 'A reproducible gacha system for Ingress First Saturday events',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/ifs-gacha-system/',
        scope: '/ifs-gacha-system/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        navigateFallback: '/ifs-gacha-system/404',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/$/, /^\/ifs-gacha-system\/$/],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
