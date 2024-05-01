import { BaseOptions } from './common';
import { lookup } from './lookup';

export interface AppOptions extends BaseOptions {
  id?: number;
  appId?: string;
}

export async function app(opts: AppOptions) {
  if (!opts.id && !opts.appId) {
    throw new Error('Either id or appId is required');
  }

  const idField = opts.id ? 'id' : 'bundleId';
  const idValue = opts.id || opts.appId;

  if (!idValue) {
    throw new Error('Either id or appId is required');
  }

  const lookupResult = await lookup(
    [idValue.toString()],
    idField,
    opts.country,
    opts.lang,
    opts.requestOptions,
  );

  if (!lookupResult || lookupResult.length === 0) {
    throw new Error('App not found');
  }

  return lookupResult[0];
}
