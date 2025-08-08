
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ee8aa16bc2e14e74bfe4da0f3a684c56',
  appName: 'pup-shot-reminder-app',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://ee8aa16b-c2e1-4e74-bfe4-da0f3a684c56.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
