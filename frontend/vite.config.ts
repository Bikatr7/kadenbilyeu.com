import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => 
{

  if(mode === 'production') 
  {
    process.env.NODE_ENV = 'production';
  } 
  else 
  {
    process.env.NODE_ENV = 'development';
  }

  return {
    plugins: [react()],
    build: {
      sourcemap: true,
    },
    server: {
      port: 5173, 
    },
  }
})
