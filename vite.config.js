import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: './',
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
      },
    },
  },
  resolve: {
    alias: {
      '/src': path.resolve(__dirname, './src')
    }
  },
  publicDir: 'src',
})