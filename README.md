# rollup-plugin-zip

[Rollup](https://github.com/rollup/rollup) plugin to zip up emitted files.

This plugin was inspired by the
[zip-webpack-plugin](https://github.com/erikdesjardins/zip-webpack-plugin).

rollup-plugin-zip doesn't list the output directory but gets entries from the
resulting bundle. Hence it doesn't archive any additional assets which was copied
to the output firectory manually. To handle additional assets use the
[rollup-plugin-copy2](https://github.com/mentaljam/rollup-plugin-copy2) plugin.

## Install

```sh
npm i -D rollup-plugin-zip
```

## Usage

```js
// rollup.config.js

import zip from 'rollup-plugin-zip'


export default {
  input: 'index.js',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    zip(),
  ],
}
```

## Options

### file

#### Type

```js
string
```

#### Default

```js
`${npm_package_name}-${npm_package_version}.zip` || `bundle-${npm_package_version}.zip` || 'bundle.zip'
```

An optional name of the output zip file.

## License

[MIT](LICENSE) © [Petr Tsymbarovich](mailto:petr@tsymbarovich.ru)
