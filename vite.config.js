import {defineConfig} from 'vite';
import {service} from './service.js';
export default defineConfig({base:'./',plugins:[{name:'local-tour-api',configureServer(s){s.middlewares.use(service)},configurePreviewServer(s){s.middlewares.use(service)}}]});
