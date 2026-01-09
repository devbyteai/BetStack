/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { errorTrackingService } from './src/shared/services';

// Initialize Sentry error tracking before React mounts
errorTrackingService.initialize();

AppRegistry.registerComponent(appName, () => App);
