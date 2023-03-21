import type { BuildOptions as ESBuildOptions } from 'esbuild';
import * as esbuild from 'esbuild';
import fs from 'fs-extra';
import { join } from 'path';

import { BuildOptions } from '../utils/options';
import { writePkgJson } from '../utils/write-pkg-json';
import { getEsbuildAliases, getEsbuildExternalModules } from './util';

/**
 * Runs esbuild to bundle the `cli` submodule
 *
 * @param opts build options needed to generate the rollup configuration
 * @returns an array containing the generated rollup options
 */
export async function buildCli(opts: BuildOptions) {
  // clear out rollup stuff
  fs.emptyDir(opts.output.cliDir);

  const inputDir = join(opts.srcDir, 'cli');
  const buildDir = join(opts.buildDir, 'cli');

  const outputDir = opts.output.cliDir;
  const esmFilename = join(outputDir, 'index.js');
  const cjsFilename = join(outputDir, 'index.cjs');

  const dtsFilename = 'index.d.ts';

  const cliAliases = getEsbuildAliases(opts);

  const external = getEsbuildExternalModules(opts, opts.output.cliDir);

  const cliEsbuildOptions: ESBuildOptions = {
    entryPoints: [join(inputDir, 'index.ts')],
    bundle: true,
    platform: 'node',
    outfile: esmFilename,
    logLevel: 'info',
    sourcemap: 'linked',
    external,
    alias: cliAliases,
  };

  // ESM build
  await esbuild.build({
    ...cliEsbuildOptions,
    outfile: esmFilename,
    format: 'esm',
  });

  // CommonJS build
  await esbuild.build({
    ...cliEsbuildOptions,
    outfile: cjsFilename,
    format: 'cjs',
  });

  // create public d.ts
  let dts = await fs.readFile(join(buildDir, 'public.d.ts'), 'utf8');
  dts = dts.replace('@stencil/core/internal', '../internal/index');
  await fs.writeFile(join(opts.output.cliDir, dtsFilename), dts);

  // copy config-flags.d.ts
  let configDts = await fs.readFile(join(buildDir, 'config-flags.d.ts'), 'utf8');
  configDts = configDts.replace('@stencil/core/declarations', '../internal/index');
  await fs.writeFile(join(opts.output.cliDir, 'config-flags.d.ts'), configDts);

  // write @stencil/core/compiler/package.json
  writePkgJson(opts, opts.output.cliDir, {
    name: '@stencil/core/cli',
    description: 'Stencil CLI.',
    main: cjsFilename,
    module: esmFilename,
    types: dtsFilename,
  });
}
