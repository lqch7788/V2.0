import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
console.log('__dirname =', __dirname)

const V1_1_ROOT = path.resolve(__dirname, '../../../V1.1/src')
console.log('V1_1_ROOT =', V1_1_ROOT)
console.log('Exists?', fs.existsSync(V1_1_ROOT))
console.log('SystemConfig exists?', fs.existsSync(path.join(V1_1_ROOT, 'pages/SystemConfig.tsx')))
