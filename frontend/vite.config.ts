import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Auth: el backend Express (auth-only) corre en :3000. Se mantiene el
      // prefijo `/api/users` para no colisionar con la pipeline API de :5000.
      // Así la cookie httpOnly `access_token` queda como first-party en dev.
      "/api/users": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Datos del Mapa Interactivo → GET /api/map/getAllPos, /getAllTopZones,
      // /getAllFactories, /getAllWarehouse.
      "/api/map": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Datos del Dashboard → GET /api/dashboard/getAllKpis, /getAllPosCoverage,
      // /getAllPosCoverageGap.
      "/api/dashboard": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Datos de Control Operativo → GET /api/control/getAllAgentsLog,
      // /getAllAgentRecords.
      "/api/control": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})
