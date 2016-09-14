import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  dest: './dist/server.js',
  entry: './src/server.js',
  format: 'cjs',
  plugins: [
    resolve({
      jsnext: true
    }),
    commonjs()
  ]
};
