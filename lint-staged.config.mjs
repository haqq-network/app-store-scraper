export default {
  '*.{ts,js,tsx,jsx,cjs,mjs,css,json,md,mdx,html,yaml,yml}': [
    'yarn lint --fix',
    'yarn prettier --write',
  ],
};
