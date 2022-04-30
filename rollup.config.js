import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';
import css from 'rollup-plugin-css-only';
import malina from 'malinajs/malina-rollup'
import malinaSass from 'malinajs/plugins/sass'

const name = pkg.name
   .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
   .replace(/^\w/, m => m.toUpperCase())
   .replace(/-\w/g, m => m[1].toUpperCase());

export default {
   input: 'src/index.js',
   output: [{
         file: pkg.module,
         'format': 'esm'
      },
      {
         file: pkg.main,
         'format': 'umd',
         name
      }
   ],
   plugins: [
      malina({
         css: false,
         autoimport: (name) => `import ${name} from './${name}.xht'`,
         plugins: [malinaSass()]
      }),
      resolve(),
      css({
         output: 'style.css'
      }),
   ]
};