import { BaseOptions, doRequest, storeId } from './common';
import { CleanedApp, lookup } from './lookup';

const BASE_URL =
  'https://search.itunes.apple.com/WebObjects/MZStore.woa/wa/search?clientApplication=Software&media=software&term=';

export interface SearchOptions extends BaseOptions {
  term: string;
  num?: number;
  page?: number;
  idsOnly?: boolean;
}

interface SearchResult {
  type: number;
  id: string;
  entity: string;
}

interface ResponseBubble {
  results: SearchResult[];
}

interface SearchResponse {
  bubbles: ResponseBubble[];
}

function paginate<T>(items: T[], num: number = 50, page: number = 1): T[] {
  const pageIndex = page - 1;
  const pageStart = num * pageIndex;
  const pageEnd = pageStart + num;
  return items.slice(pageStart, pageEnd);
}

export async function search(
  opts: SearchOptions,
): Promise<string[] | CleanedApp[]> {
  if (!opts.term) {
    throw new Error('Term is required');
  }

  opts.country = opts.country || 'us';

  const url = `${BASE_URL}${encodeURIComponent(opts.term)}`;
  const STORE_ID = storeId(opts.country);
  const lang = opts.lang || 'en-us';
  const headers = {
    'X-Apple-Store-Front': `${STORE_ID},24 t:native`,
    'Accept-Language': lang,
    Accept: 'application/json',
  };

  try {
    const response = await doRequest<SearchResponse>(
      url,
      headers,
      opts.requestOptions,
    );

    if (!response) {
      throw new Error('No results found');
    }

    const items = response.bubbles[0]?.results || [];
    const paginatedItems = paginate(items, opts.num, opts.page);
    const ids = paginatedItems.map((item) => {
      return item.id;
    });

    if (!opts.idsOnly) {
      return await lookup(
        ids,
        'id',
        opts.country,
        opts.lang,
        opts.requestOptions,
      );
    }

    return ids;
  } catch (error: unknown) {
    throw new Error(
      `Error fetching search results: ${(error as Error).message}`,
    );
  }
}
