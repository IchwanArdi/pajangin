import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Script ini dijalankan otomatis setelah `nest build`.
// Tujuannya: menyalin package.json ke dalam folder dist/.
// Hal ini sangat penting untuk Vercel Serverless Function agar Node.js
// mengenali file yang di-compile di /var/task sebagai ES Module ("type": "module"),
// sehingga mencegah error "SyntaxError: Cannot use import statement outside a module".

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

if (fs.existsSync(distDir)) {
  fs.copyFileSync(
    path.resolve(rootDir, 'package.json'),
    path.resolve(distDir, 'package.json')
  );
  console.log('✅ Berhasil menyalin package.json ke dist/ untuk dukungan ES Module di Vercel');
}
