// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  publicDir: 'static',
  build: {
    sourcemap: true,
    rollupOptions: {
      include: {

      },
      input: {
        main: resolve(__dirname, 'index.html'),
        room: resolve(__dirname, 'room.html'),
        face: resolve(__dirname, 'face.html'),
        double: resolve(__dirname, 'double.html'),
        color: resolve(__dirname, 'color.html')
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      keepNames: true
    }
  }
})