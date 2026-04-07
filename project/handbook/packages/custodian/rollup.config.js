import fs from 'node:fs'
import esbuild from 'rollup-plugin-esbuild'
import { defineConfig } from 'rollup'
import { globSync } from 'glob'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

const OUT_DIR = '../../www'

// eslint-disable-next-line unused-imports/no-unused-vars
function prune() {
  return {
    name: 'prune',
    buildEnd() {
      fs.existsSync(OUT_DIR) && fs.rmSync(OUT_DIR, { recursive: true })
    },
  }
}

function specs() {
  return globSync('spec/**/*.spec.ts')
}

const plugins = [
  json(),
  esbuild({
    target: 'node14',
  }),
  nodeResolve(),
]

export default defineConfig([
  {
    input: specs(),
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].mjs',
    },
    plugins,
  },
])
