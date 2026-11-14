// Lab-only dev server: same project, no hot reload, so long captures are not interrupted while files change.
import {defineConfig,mergeConfig} from 'vite';
import base from './vite.config';
export default mergeConfig(typeof base==='function'?(base as (env:unknown)=>object)({command:'serve',mode:'development'}):base,defineConfig({server:{hmr:false,port:5175,strictPort:true},cacheDir:'node_modules/.vite-lab'}));
