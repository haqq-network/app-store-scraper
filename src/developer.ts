import { lookup } from './common';

export default async function developer(opts:any) {
  if (!opts.devId) {
    throw new Error('devId is required');
  }

  try {
    const results = await lookup(
      [opts.devId],
      'id',
      opts.country,
      opts.lang,
      opts.requestOptions,
      opts.throttle,
    );

    // Check if results contain artist metadata
    if (results.length === 0) {
      throw new Error('Developer not found (404)');
    }

    // If present, slice the results to skip the artist metadata
    return results as any[]; // Assuming results are of type `any[]`
  } catch (error) {
    throw error; // Rethrow any caught errors for the caller to handle
  }
}
