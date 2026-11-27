import {defineConfig} from '@playwright/test';

export default defineConfig({
 testDir:'./qa',workers:1,reporter:'list',
 use:{baseURL:'http://127.0.0.1:4178',launchOptions:{
  executablePath:process.env.CHROMIUM_EXECUTABLE||undefined
 }},
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4178 --strictPort',
  url:'http://127.0.0.1:4178',reuseExistingServer:false,
  env:{AI_PROVIDER:'offline',GMAIL_ACCESS_TOKEN:'',RENTCAST_API_KEY:''}}
});
