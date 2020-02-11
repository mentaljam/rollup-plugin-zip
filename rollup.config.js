import typescript from 'rollup-plugin-typescript2'


const formats = ['cjs', 'es']

const config = formats.map(format => ({
  input: 'src/index.ts',
  output: {
    file: `dist/index.${format}.js`,
    format,
  },
  external: [
    'fs',
    'path',
    'yazl',
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
}))

config.push({
  input: 'test/test.ts',
  output: {
    file: `test/test.js`,
    format: 'cjs',
  },
  external: [
    'colors',
    'fs',
    'path',
    'rollup',
    'yauzl',
    'yazl',
  ],
  plugins: [
    typescript({
      tsconfig: './test/tsconfig.json',
    }),
  ],
})

export default config
