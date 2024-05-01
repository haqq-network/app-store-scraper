import { parseStringPromise } from 'xml2js'; // xml2js поддерживает промисы с версии 0.4.20
import { BASE_URL } from './constants';
import { BaseOptions, doRequest, storeId } from './common';

interface SuggestOptions extends BaseOptions {
  term: string;
}

interface Suggestion {
  term: string;
}

interface ParsedXML {
  plist: {
    dict: Array<{
      array: Array<{
        dict: Array<{
          string: string[];
        }>;
      }>;
    }>;
  };
}

async function parseXML(xmlString: string): Promise<ParsedXML> {
  try {
    const result = await parseStringPromise(xmlString);
    return result;
  } catch (error: unknown) {
    throw new Error('Failed to parse XML: ' + (error as Error).message);
  }
}

function extractSuggestions(xml: ParsedXML): Suggestion[] {
  const list = xml.plist.dict[0]?.array[0]?.dict || [];
  return list.map((item) => ({
    term: item.string[0],
  }));
}

export async function suggest(opts: SuggestOptions): Promise<Suggestion[]> {
  if (!opts || !opts.term) {
    throw new Error('Term is required for suggestions.');
  }

  opts.country = opts.country || 'us';

  const baseUrl = BASE_URL + encodeURIComponent(opts.term);
  const storeFrontHeader = {
    'X-Apple-Store-Front': `${storeId(opts.country)},29`,
  };

  const response = await doRequest<string>(
    baseUrl,
    storeFrontHeader,
    opts.requestOptions,
    'text',
  );

  if (!response) {
    throw new Error('No response text.');
  }

  const parsedData = await parseXML(response);
  const suggestions = extractSuggestions(parsedData);

  return suggestions;
}
