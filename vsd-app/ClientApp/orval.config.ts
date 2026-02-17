import { defineConfig, Options } from 'orval';

const commonOutputConfig: Options['output'] = {
  mode: 'tags-split',
  client: 'angular',
  mock: false,
  prettier: true,
  indexFiles: true,
  clean: true,
  workspace: 'src',
  schemas: 'model',
  target: 'api'
};

const applicationApi: Options = {
  output: {
    ...commonOutputConfig
  },
  input: {
    target: 'http://localhost:5000/swagger/v1/swagger.json'
  }
};

export default defineConfig({
  applicationApi
});
