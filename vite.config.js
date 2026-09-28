import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Le seul morceau au-delà est celui du créateur de circuit : Mapbox GL pèse
    // à lui seul 1,8 Mo et ne se découpe pas. Il n'est téléchargé que sur
    // /composer (route chargée à la demande, cf. routes/router.jsx).
    chunkSizeWarningLimit: 2100,
  },
})
