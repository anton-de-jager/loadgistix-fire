import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.loadgistix.www',
  appName: 'loadgistix',
  webDir: 'dist/loadgistix',
  bundledWebRuntime: false,
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_logo_text_on_dark",
      iconColor: "#4F46E5",
      sound: "beep.wav"
    }
  }
};

export default config;
