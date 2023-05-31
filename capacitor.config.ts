import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.loadgistix.www',
  appName: 'Loadgistix',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
