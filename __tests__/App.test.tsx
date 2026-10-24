/**
 * @format
 */

import ReactTestRenderer from 'react-test-renderer';
import { App } from '../src/app';
import { createNodeSqliteDatabase } from './support/nodeSqliteDatabase';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

test('migrates the database, then shows the five tabs', async () => {
  const database = createNodeSqliteDatabase();
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <App openDatabase={() => database} />,
    );
  });

  const [version] = await database.query('PRAGMA user_version');
  expect(Number(version.user_version)).toBeGreaterThan(0);
  for (const label of ['Clientes', 'Serviços', 'Catálogo', 'Caixa', 'Ajustes']) {
    expect(renderer.root.findAllByProps({ children: label }).length).toBeGreaterThan(0);
  }
  await ReactTestRenderer.act(async () => renderer.unmount());
});

test('shows an error instead of the app when the database cannot open', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <App
        openDatabase={() => {
          throw new Error('disk unavailable');
        }}
      />,
    );
  });

  expect(
    renderer.root.findAllByProps({
      children: 'Não foi possível abrir os dados do ateliê',
    }).length,
  ).toBeGreaterThan(0);
  expect(renderer.root.findAllByProps({ children: 'Clientes' })).toHaveLength(0);
  renderer.unmount();
});
