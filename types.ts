export interface AppOptions {
  id: number;
  appId?: string;
  country: string;
  lang?: string;
  ratings?: boolean;
  requestOptions: Record<string, string>;
}

export interface RatingOptions
  extends Pick<AppOptions, 'id' | 'country' | 'requestOptions'> {}

export interface SimilarOptions extends Omit<AppOptions, 'ratings'> {}

export interface DeveloperOptions
  extends Pick<AppOptions, 'country' | 'lang' | 'requestOptions'> {
  devId: number;
}

export interface PrivacyOptions extends RatingOptions {}

export interface SearchOptions {
  term: string;
  num: number;
  page: number;
  country: string;
  lang: string;
  requestOptions: Record<string, string>;
  idsOnly?: boolean;
}

export interface ReviewOptions extends Omit<AppOptions, 'ratings' | 'lang'> {
  sort: SORT;
  page: number;
}

export type SORT = 'mostRecent' | 'mostHelpful';
