import typescript from 'rollup-plugin-typescript2'


const formats = [
  ['cjs', 'ES2019'],
  ['es',  'ESNext'],
]

const config = formats.map(([format, target]) => ({
  input: 'src/index.ts',
  output: {
    file: `dist/index.${format}.js`,
    format,
    exports: 'auto',
  },
  external: [
    'fs',
    'path',
    'yazl',
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          target,
        },
      },
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
