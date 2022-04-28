const { build } = require("esbuild");
const malina = require("malinajs");
const fsp = require("fs/promises");
const sassPlugin = require("malinajs/plugins/sass.js");

compile();

function malinaPlugin() {
   const cssModules = new Map();
   return {
      name: "malina-plugin",
      setup(build) {
         build.onLoad({ filter: /\.(xht|ma|html)$/ }, async (args) => {
            let source = await fsp.readFile(args.path, "utf8");
            let ctx = await malina.compile(source, {
               path: args.path,
               name: args.path.match(/([^/\\]+)\.\w+$/)[1],
               css: false,
               plugins: [sassPlugin()],
               autoimport: (name) => `import ${name} from './${name}.xht';`,
            });
            let code = ctx.result;
            if (ctx.css.result) {
               const cssPath = args.path
                  .replace(/\.\w+$/, ".malina.css")
                  .replace(/\\/g, "/");
               cssModules.set(cssPath, ctx.css.result);
               code += `\nimport "${cssPath}";`;
            }
            return { contents: code };
         });

         build.onResolve({ filter: /\.malina\.css$/ }, ({ path }) => {
            return { path, namespace: "malinacss" };
         });

         build.onLoad(
            { filter: /\.malina\.css$/, namespace: "malinacss" },
            ({ path }) => {
               const css = cssModules.get(path);
               return css ? { contents: css, loader: "css" } : null;
            }
         );
      },
   };
}

function compile() {
   let options = {
      entryPoints: ["src/index.js"],
      bundle: true,
      outfile: "dist/index.js",
      plugins: [malinaPlugin()],
   };
   build(options);
   options = {
      ...options,
      format: "esm",
      outfile: "dist/esm/index.js",
   };
   build(options);
}
