import { doRequest } from './common';
import { LOOKUP_URL } from './constants';

export interface LookupApp {
  isGameCenterEnabled: boolean;
  supportedDevices: string[];
  advisories: string[];
  features: string[];
  artworkUrl60: string;
  artistViewUrl: string;
  artworkUrl100: string;
  screenshotUrls: string[];
  appletvScreenshotUrls: string[];
  artworkUrl512: string;
  ipadScreenshotUrls: string[];
  kind: string;
  releaseNotes: string;
  trackId: number;
  trackName: string;
  releaseDate: string;
  genreIds: string[];
  sellerName: string;
  primaryGenreName: string;
  primaryGenreId: number;
  isVppDeviceBasedLicensingEnabled: boolean;
  currentVersionReleaseDate: string;
  artistId: number;
  artistName: string;
  genres: string[];
  price: number;
  description: string;
  currency: string;
  bundleId: string;
  minimumOsVersion: string;
  sellerUrl: string;
  languageCodesISO2A: string[];
  userRatingCountForCurrentVersion: number;
  fileSizeBytes: string;
  averageUserRating: number;
  averageUserRatingForCurrentVersion: number;
  trackViewUrl: string;
  trackContentRating: string;
  formattedPrice: string;
  trackCensoredName: string;
  contentAdvisoryRating: string;
  version: string;
  wrapperType?: 'software' | string;
  userRatingCount: number;
}

export interface CleanedApp {
  id: number;
  appId: string;
  title: string;
  url?: string;
  description: string;
  icon: string;
  genres: string[];
  genreIds: string[];
  primaryGenre: string;
  primaryGenreId: number;
  contentRating: string;
  languages: string[];
  size: string;
  requiredOsVersion: string;
  released: string;
  updated: string;
  releaseNotes: string;
  version: string;
  price: number;
  currency: string;
  free: boolean;
  developerId: number;
  developer: string;
  developerUrl: string;
  developerWebsite: string;
  score: number;
  reviews: number;
  currentVersionScore: number;
  currentVersionReviews: number;
  screenshots: string[];
  ipadScreenshots: string[];
  appletvScreenshots: string[];
  supportedDevices: string[];
}

function cleanLookupApp(app: LookupApp): CleanedApp {
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

export async function lookup(
  ids: string[],
  idField: 'id' | 'bundleId' = 'id',
  country: string = 'us',
  lang?: string,
  requestOptions?: Record<string, string>,
) {
  const joinedIds = ids.join(',');
  const url = new URL(LOOKUP_URL);
  url.searchParams.set(idField, joinedIds);
  url.searchParams.set('country', country);
  url.searchParams.set('entity', 'software');
  url.searchParams.set('lang', lang || 'en-us');

  try {
    const response = await doRequest<{
      resultCount: number;
      results: LookupApp[];
    }>(url, {}, requestOptions);

    if (
      !response ||
      !response.results ||
      response.resultCount === 0 ||
      response.results.length === 0
    ) {
      throw new Error('No results found');
    }

    const filteredResults = response.results.filter((app) => {
      return !app.wrapperType || app.wrapperType === 'software';
    });
    const cleanedResults = filteredResults.map((app) => {
      return cleanLookupApp(app);
    });

    return cleanedResults;
  } catch (error: unknown) {
    throw new Error(`Lookup failed: ${(error as Error).message}`);
  }
}
