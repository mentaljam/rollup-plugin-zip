import 'colors'
import * as fs from 'fs'
import * as rollup from 'rollup'
import * as yauzl from 'yauzl'

import zip from 'rollup-plugin-zip'


const PACKAGE_NAME     = 'test'
const PACKAGE_VERSION  = '1.0'
const DEFAULT_FILENAME = `${PACKAGE_NAME}-${PACKAGE_VERSION}.zip`


/* eslint-disable @typescript-eslint/camelcase */
process.env.npm_package_name    = PACKAGE_NAME
process.env.npm_package_version = PACKAGE_VERSION
/* eslint-enable @typescript-eslint/camelcase */

interface IBuildPars<T> {
  dir: string,
  options?: T,
}

const build = async <T>({
  dir,
  options,
}: IBuildPars<T>): Promise<void> => {
  const bundle = await rollup.rollup({
    input: [
      `test/src/bar.js`,
      `test/src/baz.js`,
    ],
    plugins: [
      zip(options),
    ],
  })
  await bundle.write({
    chunkFileNames: '[name].js',
    dir: `test/dist/${dir}`,
    format: 'es',
  })
}

const promisedOpen = (
  path: string,
): Promise<yauzl.ZipFile> => new Promise((resolve, reject) => {
  yauzl.open(path, {lazyEntries: true, autoClose: true}, (err, zipfile) => {
    if (err) {
      return reject(err)
    }
    resolve(zipfile)
  })
})

const promisedReadEntries = (
  zipfile: yauzl.ZipFile,
): Promise<void> => new Promise((resolve, reject) => {
  const expectedEntries = new Set([
    'foo.js',
    'bar.js',
    'baz.js',
  ])
  zipfile.readEntry()
  zipfile.on('entry', ({fileName: entryname}) => {
    if (expectedEntries.has(entryname)) {
      expectedEntries.delete(entryname)
    } else {
      throw new Error(`unexpected zip entry: "${entryname}"`)
    }
    zipfile.readEntry()
  })
  zipfile.on('end', () => {
    if (expectedEntries.size === 0) {
      resolve()
    } else {
      reject(new Error(`not all expected entries are presented in the zip file: [${[...expectedEntries]}]`))
    }
  })
})

let ERROR_COUNT = 0

const testCase = async <T>(
  title: string,
  options: IBuildPars<T>,
  filename: string,
): Promise<void> => {
  title = `Testing ${title}`
  console.info(title)
  try {
    await build(options)
    if (!fs.existsSync(filename)) {
      throw new Error(`expected the file to exist: "${filename}"`)
    }
    const zipfile = await promisedOpen(filename)
    await promisedReadEntries(zipfile)
    console.info(`${title} - ${'Success'.green}`)
  } catch (error) {
    ERROR_COUNT += 1
    console.error(`${title} - ${error.message.red}`)
  }
}

Promise.all([
  testCase(
    'without options',
    {
      dir: 'nooptions'
    },
    `test/dist/nooptions/${DEFAULT_FILENAME}`,
  ),

  testCase(
    'with defined file name',
    {
      dir: 'file',
      options: {
        file: 'bundle.zip'
      }
    },
    'test/dist/file/bundle.zip',
  ),

  testCase(
    'with defined directory name',
    {
      dir: 'dir',
      options: {
        dir: `test/dist/dir/output`,
      },
    },
    `test/dist/dir/output/${DEFAULT_FILENAME}`,
  ),

]).then(() => {
  if (ERROR_COUNT === 0) {
    console.info('All tests passed'.green)
  } else {
    console.error(`${ERROR_COUNT} test(s) failed`.red)
    process.exit(1)
  }
})
