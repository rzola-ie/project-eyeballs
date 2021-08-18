// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        room: resolve(__dirname, 'room.html'),
        face: resolve(__dirname, 'face.html')
      }
    }
  }
})