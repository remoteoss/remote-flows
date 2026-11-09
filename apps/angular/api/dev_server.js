const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const app = require('./index.js');

const envArg = process.argv.find((arg) => arg.startsWith('--env='));
const envName = envArg?.split('=')[1];

if (!envName || !/^[\w-]+$/.test(envName)) {
  console.error('Pass an env name, e.g. pnpm run start:api --env=sandbox');
  process.exit(1);
}

const envFile = path.resolve(__dirname, '../../..', `.env.${envName}`);

if (!fs.existsSync(envFile)) {
  console.error(`${envFile} does not exist.`);
  process.exit(1);
}

Object.assign(process.env, dotenv.parse(fs.readFileSync(envFile)));

const port = Number(process.env.API_PORT ?? 3002);

app.listen(port, () => {
  process.stdout.write(
    `Loaded ${envFile}; API proxy at http://localhost:${port}\n`,
  );
});
