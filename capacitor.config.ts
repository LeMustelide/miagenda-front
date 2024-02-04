import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.miagenda.app',
  appName: 'MIAGENDA',
  webDir: 'dist/miagenda',
  server: {
    androidScheme: 'https'
  }
};

export default config;
