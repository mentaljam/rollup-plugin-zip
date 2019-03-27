import copy from 'rollup-plugin-copy2'
import zip from 'rollup-plugin-zip'


const config = ({
  dir,
  options,
}) => ({
  input: 'index.js',
  output: {
    dir,
    format: 'es',
  },
  plugins: [
    copy({
      assets: [
        'README.md',
        ['data.txt', 'assets/data.txt'],
      ],
    }),
    zip(options),
  ],
})

export default [
  config({
    dir: 'dist_nooptions'
  }),
  config({
    dir: 'dist_file',
    options: {
      file: 'bundle.zip'
    }
  }),
  config({
    dir: 'dist_dir',
    options: {
      dir: 'dist_dir/output',
    }
  })
]
