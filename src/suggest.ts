import { parseString } from 'xml2js';
import { BASE_URL } from './constants';
import { doRequest, storeId } from './common';

function parseXML(string: string) {
  return new Promise(function (resolve, reject) {
    return parseString(string, (err: any, res: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}

function extractSuggestions(xml) {
  const toJSON = (item) => ({
    term: item.string[0],
  });

  const list = xml.plist.dict[0].array[0].dict || [];

  return list.map(toJSON);
}

// TODO see language Accept-Language: en-us, en;q=0.50

export async function suggest(opts) {
  return new Promise(function (resolve) {
    if (!opts && !opts.term) {
      throw Error('term missing');
    }

    return resolve(BASE_URL + encodeURIComponent(opts.term));
  })
    .then((url) =>
      doRequest(
        url as string,
        { 'X-Apple-Store-Front': `${storeId(opts.country)},29` },
        opts.requestOptions,
      ),
    )
    .then(parseXML)
    .then(extractSuggestions);
}
