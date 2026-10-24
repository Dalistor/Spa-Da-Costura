/**
 * Composition root: binds the app to the on-device SQLite database.
 *
 * @format
 */

import { App } from './src/app';
import { openAppDatabase } from './src/database/openAppDatabase';

export default function Root() {
  return <App openDatabase={openAppDatabase} />;
}
