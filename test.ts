import store from './dist/main';

// TODO: Use Jest for testing
async function test() {
  const result = await Promise.all([
    // store.app({ id: 6443843352 }), // Works
    // store.app({ appId: 'com.haqq.wallet' }), // Works
    // store.ratings({ id: 6443843352 }), // Works
    // store.developer({ devId: 1649910836 }), // Works
    // store.list({
    //   category: CATEGORY.FINANCE,
    //   num: 2,
    // }), // Works
    // store.list({
    //   category: CATEGORY.FINANCE,
    //   num: 2,
    //   fullDetail: true,
    // }), // Works
    // store.privacy({ id: 6443843352 }), // Works
    // store.reviews({ id: 6443843352 }), // Works
    // store.search({
    //   term: 'haqq',
    //   page: 1,
    //   num: 1,
    // }), // Works,
    // store.similar({ id: 6443843352 }), // Works
    store.suggest({ term: 'haqq' }), // Works
  ]);

  console.log(JSON.stringify(result, null, 2));
}

test();
