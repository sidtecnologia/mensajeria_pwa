import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

function injectBuildTime() {
  return {
    name: 'inject-build-time',
    closeBundle() {
      const swPath = resolve(__dirname, 'dist/sw.js')
      try {
        const content = readFileSync(swPath, 'utf-8')
        const stamped = content.replace('__BUILD_TIME__', Date.now().toString())
        writeFileSync(swPath, stamped)
      } catch {}
    },
  }
}

export default defineConfig({
  plugins: [react(), injectBuildTime()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})