import * as fs from 'fs'
import * as path from 'path'
import {OutputAsset, Plugin} from 'rollup'
import {ZipFile} from 'yazl'


const isAsset = (entry: any): entry is OutputAsset => !!entry.isAsset

interface IPluginOptions {
  file?: string
  dir?: string
}

const enum Cache {
  distdir = 'distdir',
  outfile = 'outfile',
  sourcemapFile = 'sourcemapFile',
}

export default (options?: IPluginOptions): Plugin => ({
  name: 'zip',
  generateBundle({dir, sourcemap, sourcemapFile}) {
    // Save the output directory path
    let distDir = process.cwd()
    if (dir) {
      distDir = path.resolve(distDir, dir)
    }
    this.cache.set(Cache.distdir, distDir)
    if (sourcemap) {
      this.cache.set(Cache.sourcemapFile, sourcemapFile)
    }
    // Get options
    let outFile = options && options.file
    const outDir = options && options.dir
    if (outFile) {
      if (outDir) {
        this.warn('Both the `file` and `dir` options are set - `dir` has no effect')
      }
      if (!path.isAbsolute(outFile)) {
        outFile = path.resolve(distDir, outFile)
      }
    } else {
      const {npm_package_name, npm_package_version} = process.env
      outFile = npm_package_name || 'bundle'
      if (npm_package_version) {
        outFile += '-' + npm_package_version
      }
      if (outDir && !(fs.existsSync(outDir) && fs.statSync(outDir).isDirectory())) {
        fs.mkdirSync(outDir, {recursive: true})
      }
      outFile = path.resolve(outDir || distDir, outFile + '.zip')
    }
    // Save the output file path
    this.cache.set(Cache.outfile, outFile)
  },
  writeBundle(bundle) {
    const distDir = this.cache.get(Cache.distdir)
    const sourcemapFile = this.cache.get(Cache.sourcemapFile)
    const zipFile = new ZipFile()
    Object.entries(bundle).forEach(([_, entry]) => {
      if (isAsset(entry)) {
        const {fileName, source} = entry
        const buffer = Buffer.isBuffer(source) ? source : new Buffer(source)
        zipFile.addBuffer(buffer, fileName)
      } else {
        const {fileName} = entry
        zipFile.addFile(path.resolve(distDir, fileName), fileName)
      }
    })
    if (sourcemapFile) {
      zipFile.addFile(path.resolve(distDir, sourcemapFile), sourcemapFile)
    }
    const outFile = this.cache.get(Cache.outfile)
    zipFile.outputStream.pipe(fs.createWriteStream(outFile))
    zipFile.end()
  },
})
