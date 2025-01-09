import express from 'express';
import path from 'path';
import nunjucks from 'nunjucks';

export default (app: express.Application): void => {
  const __views_path__ = CONFIG.views.viewsDir;
  const __public_path__ = CONFIG.views.publicDir;

  const viewsDir = path.join(__dirname, __views_path__);

  const nunjucksEnv = nunjucks.configure(viewsDir, {
    autoescape: true,
    express: app,
    watch: !CONFIG.runningProd,
    noCache: !CONFIG.runningProd,
    throwOnUndefined: false,
    trimBlocks: false,
    lstripBlocks: false,
  });

  nunjucksEnv.addFilter('json', (str) => JSON.stringify(str, null, 2));

  nunjucksEnv.addFilter('removeParamFromQuery', (filters, paramToRemove) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== paramToRemove && value) {
        params.set(key, value as string);
      }
    });
    return params.toString();
  });

  nunjucksEnv.addFilter('merge', (obj1, obj2) => {
    return { ...obj1, ...obj2 };
  });

  nunjucksEnv.addFilter('json_encode', function (value) {
    return JSON.stringify(value);
  });

  nunjucksEnv.addFilter('raw', function (value) {
    return value;
  });

  nunjucksEnv.addGlobal('timestamp', () => Date.now());
  nunjucksEnv.addGlobal('CONFIG', CONFIG);

  app.set('view engine', 'njk');
  app.set('views', viewsDir);
  app.use(express.static(path.join(__dirname, __public_path__)));
};
