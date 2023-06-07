import { catchError } from '@utils';

import type { BuildResultsComponentGraph, Diagnostic, ValidatedConfig } from '../declarations';
import type { CoreCompiler } from './load-compiler';
import { startupCompilerLog } from './logs';

/**
 * Invokes the prerender task.
 *
 * This function is intended to be invoked when as the only task in a Stencil invocation:
 * ```bash
 * npx stencil prerender ...
 * ```
 *
 * As opposed to running prerender as a part of the build task:
 * ```bash
 * npx stencil build --prerender ...
 * ```
 *
 * @param coreCompiler the Stencil core compiler instance to use
 * @param config the project's validated configuration
 * @returns `undefined`. Process is terminated in the event that errors occur during the pre-render.
 */
export const taskPrerender = async (coreCompiler: CoreCompiler, config: ValidatedConfig): Promise<void> => {
  startupCompilerLog(coreCompiler, config);

  const hydrateAppFilePath = config.flags.unknownArgs[0];

  if (typeof hydrateAppFilePath !== 'string') {
    config.logger.error(`Missing hydrate app script path`);
    return config.sys.exit(1);
  }

  const srcIndexHtmlPath = config.srcIndexHtml;

  const diagnostics = await runPrerenderTask(coreCompiler, config, hydrateAppFilePath, null, srcIndexHtmlPath);
  config.logger.printDiagnostics(diagnostics);

  if (diagnostics.some((d) => d.level === 'error')) {
    return config.sys.exit(1);
  }
};

/**
 * Invokes the prerender task
 *
 * This function is intended to be invoked either as a part of the 'prerender' task:
 * ```bash
 * npx stencil prerender ...
 * ```
 * Or as a part of the build task:
 * ```bash
 * npx stencil build --prerender ...
 * ```
 *
 * When run as the sole task, consider using {@link taskPrerender}, which wraps this function.
 *
 * @param coreCompiler the Stencil core compiler instance to use
 * @param config the project's validated configuration
 * @param hydrateAppFilePath the output destination of running this task
 * @param componentGraph a component dependency graph
 * @param srcIndexHtmlPath the path to the `index.html` file
 * @returns a collection of diagnostics, empty if prerender completes successfully
 */
export const runPrerenderTask = async (
  coreCompiler: CoreCompiler,
  config: ValidatedConfig,
  hydrateAppFilePath: string,
  componentGraph: BuildResultsComponentGraph | null,
  srcIndexHtmlPath: string
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];

  try {
    const prerenderer = await coreCompiler.createPrerenderer(config);
    const results = await prerenderer.start({
      hydrateAppFilePath,
      componentGraph,
      srcIndexHtmlPath,
    });

    diagnostics.push(...results.diagnostics);
  } catch (e: any) {
    catchError(diagnostics, e);
  }

  return diagnostics;
};
