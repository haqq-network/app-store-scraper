import axios from 'axios';
import { DEFAULT_STORE, LOOKUP_URL, MARKET_CODES } from './constants';

export function cleanApp(app: any) {
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
  headers: Record<string, any>,
  requestOptions: Record<string, any>,
  limit?: number,
): Promise<any> {
  try {
    const options = {
      headers,
      ...requestOptions,
    };

    // Make the request using `got` library and await the response
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
    throw error; // Rethrow the error to the caller
  }
}

export async function lookup(
  ids: any,
  idField: any,
  country: any,
  lang: any,
  requestOptions: any,
  limit: any,
) {
  idField = idField || 'id';
  country = country || 'us';
  const langParam = lang ? `&lang=${lang}` : '';
  const joinedIds = ids.join(',');
  const url = `${LOOKUP_URL}?${idField}=${joinedIds}&country=${country}&entity=software${langParam}`;

  try {
    const response = await doRequest(url, {}, requestOptions, limit);
    // const parsedResponse = JSON.parse(response.results[0]);
    const filteredResults = response.results.filter((app: any) => {
      return (
        typeof app.wrapperType === 'undefined' || app.wrapperType === 'software'
      );
    });
    // console.log('AJSDJHGAJSHDHJ', { filteredResults });
    const cleanedApps = filteredResults.map((app: any) => cleanApp(app));

    return cleanedApps;
  } catch (error: any) {
    throw new Error(`Lookup failed: ${error.message}`);
  }
}

export function storeId(countryCode: string): number | '143441' {
  const upperCaseCountryCode = countryCode.toUpperCase();

  // Check if countryCode exists in MARKET_CODES
  if (upperCaseCountryCode in MARKET_CODES) {
    return MARKET_CODES[upperCaseCountryCode]; // Return corresponding store ID
  } else {
    return DEFAULT_STORE; // Return default store ID if countryCode not found
  }
}

export default { lookup, cleanApp, doRequest, storeId };
