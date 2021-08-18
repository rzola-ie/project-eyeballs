// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      include: {

      },
      input: {
        main: resolve(__dirname, 'index.html'),
        room: resolve(__dirname, 'room.html'),
        face: resolve(__dirname, 'face.html')
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      keepNames: true
    }
  }
})