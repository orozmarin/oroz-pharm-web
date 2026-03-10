/**
 * Fixes tsx CJS-transform interop with @next/env.
 *
 * tsx transforms `import nextEnvImport from '@next/env'` to:
 *   const import_env = __toESM(require('@next/env'))
 * When @next/env has __esModule:true, __toESM skips adding .default,
 * but @next/env has no .default export, so import_env.default === undefined.
 *
 * This patch adds `.default = module.exports` so tsx's __toESM works correctly.
 */
'use strict'
const Module = require('module')
const _load = Module._load.bind(Module)
Module._load = function (id, parent, isMain) {
  const result = _load(id, parent, isMain)
  if (id === '@next/env') {
    process.stderr.write('PATCH: @next/env loaded, default=' + typeof result.default + '\n')
    if (result && result.__esModule && result.default === undefined) {
      result.default = result
    }
  }
  return result
}
