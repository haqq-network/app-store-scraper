import store from './dist/main';

async function test() {
  const app = await store.app({ id: '6443843352' });

  console.log({ app });
}

test();
