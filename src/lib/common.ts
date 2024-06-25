import { DEFAULT_STORE, MARKET_CODES } from './constants';
import { parseString } from 'xml2js';

export interface BaseOptions {
  country?: string;
  lang?: string;
  requestOptions?: Record<string, string>;
}

export async function doRequest<R = unknown>(
  url: string | URL,
  headers: Record<string, string>,
  requestOptions: Record<string, string> = {},
  returnType: 'json' | 'text' = 'json',
) {
  try {
    const options: RequestInit = {
      headers: new Headers(headers),
      ...requestOptions,
    };

    const response = await fetch(url, options);

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    if (returnType === 'text') {
      return response.text() as unknown as Promise<R>;
    } else {
      return response.json() as Promise<R>;
    }
  } catch (error) {
    console.error('Request error:', error);
    return null;
  }
}

export function storeId(countryCode: string) {
  const upperCaseCountryCode = countryCode.toUpperCase();

  // Check if countryCode exists in MARKET_CODES
  if (upperCaseCountryCode in MARKET_CODES) {
    return MARKET_CODES[upperCaseCountryCode].toString(); // Return corresponding store ID
  } else {
    return DEFAULT_STORE; // Return default store ID if countryCode not found
  }
}

export async function parseXML(string: string) {
  return new Promise(function (resolve, reject) {
    return parseString(string, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}
