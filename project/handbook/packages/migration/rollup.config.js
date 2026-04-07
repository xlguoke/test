import esbuild from 'rollup-plugin-esbuild'
import { defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { globSync } from 'glob'

const plugins = [
  esbuild({
    target: 'node14',
  }),
  nodeResolve(),
]

function specs() {
  return globSync('spec/**/*.spec.ts')
}

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
