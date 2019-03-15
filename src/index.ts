import * as fs from 'fs'
import * as path from 'path'
import {OutputAsset, Plugin} from 'rollup'
import {ZipFile} from 'yazl'


const isAsset = (entry: any): entry is OutputAsset => !!entry.isAsset

interface IPluginOptions {
  file?: string
}

const enum Cache {
  outdir = 'outdir',
  outfile = 'outfile',
}

export default (options?: IPluginOptions): Plugin => ({
  name: 'zip',
  generateBundle({dir}) {
    // Save the output directory path
    let outDir = process.cwd()
    if (dir) {
      outDir = path.resolve(outDir, dir)
    }
    this.cache.set(Cache.outdir, outDir)
    // Save the output file path
    let outFile = options && options.file
    if (outFile) {
      if (!path.isAbsolute(outFile)) {
        outFile = path.resolve(outDir, outFile)
      }
    } else {
      const {npm_package_name, npm_package_version} = process.env
      outFile = npm_package_name || 'bundle'
      if (npm_package_version) {
        outFile += '-' + npm_package_version
      }
      outFile = path.resolve(outDir, outFile + '.zip')
    }
    this.cache.set(Cache.outfile, outFile)
  },
  writeBundle(bundle) {
    const outDir = this.cache.get(Cache.outdir)
    const zipFile = new ZipFile()
    Object.entries(bundle).forEach(([_, entry]) => {
      if (isAsset(entry)) {
        const {fileName, source} = entry
        const buffer = Buffer.isBuffer(source) ? source : new Buffer(source)
        zipFile.addBuffer(buffer, fileName)
      } else {
        const {fileName} = entry
        zipFile.addFile(path.resolve(outDir, fileName), fileName)
      }
    })
    const outFile = this.cache.get(Cache.outfile)
    zipFile.outputStream.pipe(fs.createWriteStream(outFile))
    zipFile.end()
  },
})
