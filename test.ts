import kek from './index.ts';

async function test() {
  const app = await kek.app({ id: '6443843352' });
  console.log(app, 'KEK');
}

test();
