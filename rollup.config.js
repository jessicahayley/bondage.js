import { terser } from "rollup-plugin-terser";

import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/bondage.js',
  output: {
    file: 'dist/bondage.min.js',
    name: 'bondage',
    compact: true,
    format: 'umd'
  },
  plugins: [
    commonjs(),
    terser()
  ]
};
