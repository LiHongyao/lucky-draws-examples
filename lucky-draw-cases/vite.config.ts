/*
 * @Author: Lee
 * @Date: 2023-01-11 11:35:52
 * @LastEditors: Lee
 * @LastEditTime: 2023-01-11 11:36:57
 * @Description:
 */
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
  },
});
