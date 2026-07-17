/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            strategies: 'injectManifest',
            srcDir: '.',
            filename: 'sw.ts',
            manifest: {
                name: 'Zokul Messenger',
                short_name: 'Zokul',
                description: 'Universal messenger',
                theme_color: '#007AFF',
                background_color: '#FFFFFF',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
        }),
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:3001',
            '/uploads': 'http://localhost:3001',
            '/socket.io': {
                target: 'http://localhost:3001',
                ws: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
        include: ['__tests__/**/*.test.{ts,tsx}'],
    },
});
