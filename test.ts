import { assert } from 'console';
import store from './dist/main';

async function test() {
  const app = await store.app({ id: '6443843352' });

  console.log({ app });

  assert(app.id === 6443843352, 'App ID is not correct');
}

test();
