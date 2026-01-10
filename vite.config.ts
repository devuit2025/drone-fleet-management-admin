import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        // host: '0.0.0.0',   // already exposing to host
        port: 5173,         // dev server port
        allowedHosts: [
            'localhost',
            'api.dronefleet.test',
            'admin.dronefleet.test',   // add your virtual host here
            '127.0.0.1',
        ],
        host: true,
        watch: {
            usePolling: true,
            interval: 100
        },
        hmr: {
            protocol: 'ws',
            // host: 'admin.dronefleet.test',
            host: 'localhost', // #Here must add .env
            port: 5173,
        },
    }
});
