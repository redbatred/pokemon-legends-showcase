import { defineConfig } from 'vite';
export default defineConfig({base:process.env.SITE_BASE??'/',server:{port:5174},build:{rollupOptions:{output:{manualChunks:{pixi:['pixi.js'],motion:['gsap']}}}}});
