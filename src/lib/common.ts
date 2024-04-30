import axios from 'axios';
import { DEFAULT_STORE, LOOKUP_URL, MARKET_CODES } from './constants';

interface AppData {
  trackId: number;
  bundleId: string;
  trackName: string;
  trackViewUrl: string;
  description: string;
  artworkUrl512?: string;
  artworkUrl100?: string;
  artworkUrl60?: string;
  genres: string[];
  genreIds: string[];
  primaryGenreName: string;
  primaryGenreId: number;
  contentAdvisoryRating: string;
  languageCodesISO2A: string[];
  fileSizeBytes: number;
  minimumOsVersion: string;
  releaseDate: Date;
  currentVersionReleaseDate?: Date;
  releaseNotes: string;
  version: string;
  price: number;
  currency: string;
  artistId: number;
  artistName: string;
  artistViewUrl: string;
  sellerUrl: string;
  averageUserRating: number;
  userRatingCount: number;
  averageUserRatingForCurrentVersion: number;
  userRatingCountForCurrentVersion: number;
  screenshotUrls: string[];
  ipadScreenshotUrls: string[];
  appletvScreenshotUrls: string[];
  supportedDevices: string[];
}

export function cleanApp(app: AppData) {
  return {
    id: app.trackId,
    appId: app.bundleId,
    title: app.trackName,
    url: app.trackViewUrl,
    description: app.description,
    icon: app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60,
    genres: app.genres,
    genreIds: app.genreIds,
    primaryGenre: app.primaryGenreName,
    primaryGenreId: app.primaryGenreId,
    contentRating: app.contentAdvisoryRating,
    languages: app.languageCodesISO2A,
    size: app.fileSizeBytes,
    requiredOsVersion: app.minimumOsVersion,
    released: app.releaseDate,
    updated: app.currentVersionReleaseDate || app.releaseDate,
    releaseNotes: app.releaseNotes,
    version: app.version,
    price: app.price,
    currency: app.currency,
    free: app.price === 0,
    developerId: app.artistId,
    developer: app.artistName,
    developerUrl: app.artistViewUrl,
    developerWebsite: app.sellerUrl,
    score: app.averageUserRating,
    reviews: app.userRatingCount,
    currentVersionScore: app.averageUserRatingForCurrentVersion,
    currentVersionReviews: app.userRatingCountForCurrentVersion,
    screenshots: app.screenshotUrls,
    ipadScreenshots: app.ipadScreenshotUrls,
    appletvScreenshots: app.appletvScreenshotUrls,
    supportedDevices: app.supportedDevices,
  };
}

export async function doRequest(
  url: string,
  headers: Record<string, string>,
  requestOptions: Record<string, string>,
) {
  try {
    const options = {
      headers,
      ...requestOptions,
    };

    const { data }: any = await axios.get(url, options);

    // Check response status code
    if (data.statusCode >= 400) {
      throw new Error('Request failed with status ' + data.statusCode);
    }

    // Request successful, return response body
    console.log('Finished request');

    return data;
  } catch (error) {
    // Handle any errors during request
    console.error('Request error:', error);
    return null;
  }
}

export async function lookup(
  ids: unknown[],
  idField: string,
  country: string,
  lang: string | undefined,
  requestOptions: Record<string, string>,
) {
  idField = idField || 'id';
  country = country || 'us';
  const langParam = lang ? `&lang=${lang}` : '';
  const joinedIds = ids.join(',');
  const url = `${LOOKUP_URL}?${idField}=${joinedIds}&country=${country}&entity=software${langParam}`;

  try {
    const response = await doRequest(url, {}, requestOptions);
    // const parsedResponse = JSON.parse(response.results[0]);
    const filteredResults = response.results.filter((app) => {
      return (
        typeof app.wrapperType === 'undefined' || app.wrapperType === 'software'
      );
    });
    const cleanedApps = filteredResults.map((app: AppData) => cleanApp(app));

    return cleanedApps;
  } catch (error) {
    throw new Error(`Lookup failed: ${error.message}`);
  }
}

export function storeId(countryCode: string) {
  const upperCaseCountryCode = countryCode.toUpperCase();

  // Check if countryCode exists in MARKET_CODES
  if (upperCaseCountryCode in MARKET_CODES) {
    return MARKET_CODES[upperCaseCountryCode]; // Return corresponding store ID
  } else {
    return DEFAULT_STORE; // Return default store ID if countryCode not found
  }
}

export default { lookup, cleanApp, doRequest, storeId };
