import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        svgr({
            svgrOptions: {
                exportType: 'named',
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // Важно
        },
    },
});


/*
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr({
            svgrOptions: {
                exportType: 'default',
            },
        }),
    ],
})
*/
