import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    define: {
    _APP_VERSION_: JSON.stringify(process.env.npm_package_version),
  },
})
