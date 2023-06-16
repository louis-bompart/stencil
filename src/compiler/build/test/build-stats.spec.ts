import type * as d from '@stencil/core/declarations';
import { mockBuildCtx, mockCompilerCtx, mockValidatedConfig } from '@stencil/core/testing';
import { result } from '@utils';

import { generateBuildResults } from '../build-results';
import { generateBuildStats } from '../build-stats';

describe('generateBuildStats', () => {
  const config = mockValidatedConfig();
  let compilerCtx: d.CompilerCtx;
  let buildCtx: d.BuildCtx;

  beforeEach(() => {
    compilerCtx = mockCompilerCtx(config);
    buildCtx = mockBuildCtx(config, compilerCtx);
  });

  it('should return a structured json object', async () => {
    buildCtx.buildResults = generateBuildResults(config, compilerCtx, buildCtx);

    const result = generateBuildStats(config, buildCtx) as d.CompilerBuildStats;

    if (result.hasOwnProperty('timestamp')) {
      delete result.timestamp;
    }

    if (result.hasOwnProperty('compiler') && result.compiler.hasOwnProperty('version')) {
      delete result.compiler.version;
    }

    expect(result).toStrictEqual({
      app: { bundles: 0, components: 0, entries: 0, fsNamespace: 'testing', namespace: 'Testing', outputs: [] },
      collections: [],
      compiler: { name: 'in-memory' },
      componentGraph: {},
      components: [],
      entries: [],
      formats: { commonjs: [], es5: [], esm: [], esmBrowser: [], system: [] },
      options: {
        buildEs5: false,
        hashFileNames: false,
        hashedFileNameLength: 8,
        minifyCss: false,
        minifyJs: false,
      },
      rollupResults: {
        modules: [],
      },
      sourceGraph: {},
    });
  });

  it('should return diagnostics if an error is hit', async () => {
    buildCtx.buildResults = generateBuildResults(config, compilerCtx, buildCtx);

    buildCtx.buildResults.hasError = true;
    const diagnostic: d.Diagnostic = {
      level: 'error',
      type: 'horrible',
      messageText: 'the worst error _possible_ has just occurred',
      lines: [],
    };
    buildCtx.buildResults.diagnostics = [diagnostic];
    const result = generateBuildStats(config, buildCtx);

    expect(result).toStrictEqual({
      diagnostics: [diagnostic],
    });
  });
});
