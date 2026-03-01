/**
 * @format
 */

import 'fast-text-encoding';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initFirebase } from './src/services/firebase';

// Eager initialization for faster load times
initFirebase();

AppRegistry.registerComponent(appName, () => App);
