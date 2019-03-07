import copy from 'rollup-plugin-copy2'
import zip from 'rollup-plugin-zip'


export default {
  input: 'index.js',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    copy({
      assets: [
        'README.md',
        ['data.txt', 'assets/data.txt'],
      ],
    }),
    zip(),
  ],
}
