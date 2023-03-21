const { getOptions } = require('./scripts/build/utils/options.js');
const { buildCli } = require('./scripts/build/esbuild/cli');

async function main() {
  const opts = getOptions(__dirname, {
    isProd: !!process.argv.includes('--prod'),
    isCI: !!process.argv.includes('--ci'),
  });

  await buildCli(opts);
}

main();
