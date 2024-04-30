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

function extractSuggestions(xml: any) {
  const toJSON = (item: any) => ({
    term: item.string[0],
  });

  const list = xml.plist.dict[0].array[0].dict || [];

  return list.map(toJSON);
}

// TODO see language Accept-Language: en-us, en;q=0.50

export default async function suggest(opts: any) {
  if (!opts || !opts.term) {
    throw new Error('term missing');
  }

  try {
    const baseUrl = BASE_URL + encodeURIComponent(opts.term);
    const storeFrontHeader = {
      'X-Apple-Store-Front': `${storeId(opts.country)},29`,
    };

    const url = await Promise.resolve(baseUrl); // Resolve the base URL asynchronously

    const response = await doRequest(
      url,
      storeFrontHeader,
      opts.requestOptions,
    );
    const parsedData = await parseXML(response);
    const suggestions = await extractSuggestions(parsedData);

    return suggestions;
  } catch (error) {
    throw error; // Re-throw any caught error for consistent error propagation
  }
}
