import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json' with { type: 'json' };

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    define: {
    _APP_VERSION_: JSON.stringify(packageJson.version),
  },
})
