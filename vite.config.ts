import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/masked-icon.png'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Pegiatan',
        short_name: 'Pegiatan',
        start_url: './',
        scope: './',
        description: 'Turn your tasks into quests.',
        lang: 'en',
        theme_color: '#051730',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/masked-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/screenshot1.png',
            sizes: '360x800',
            type: 'image/png'
          },
          {
            src: 'screenshots/screenshot2.png',
            sizes: '360x800',
            type: 'image/png'
          },
          {
            src: 'screenshots/screenshot3.png',
            sizes: '360x800',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
