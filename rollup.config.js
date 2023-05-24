import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve'
import ignore from 'rollup-plugin-ignore'
import inject from '@rollup/plugin-inject'
import path from 'path'
// import terser from '@rollup/plugin-terser'

export default [
    {
        input: `src/GraphEditor.ts`,
        output: [
            {
                file: 'umd/GraphEditor.js',
                name: 'GraphEditor',
                format: 'iife',
                sourcemap: false,
                freeze: false,
            }
        ],
        plugins: [
            ignore(['canvas']),
            nodeResolve(),
            commonjs(),
            typescript()
        ],
    },
    {
        input: `src/GraphViewer.ts`,
        output: [
            {
                file: 'umd/GraphViewer.js',
                name: 'GraphViewer',
                format: 'iife',
                sourcemap: false,
                freeze: false,
            }
        ],
        plugins: [
            ignore(['canvas']),
            nodeResolve(),
            commonjs(),
            typescript()
        ],
    },
    {
        plugins: [
            ignore(['canvas']),
            nodeResolve(),
            commonjs({
                exclude: '/node_modules/'
            }),
            typescript({
                tsconfigOverride: {
                     compilerOptions: { declaration: true } 
                },
                outDir: 'esm',
                declarationDir: 'esm'
            }),
            inject({
                global: path.resolve('./build/global')
            }),
            //terser()
        ],
        input: 'src/index.all.ts',
        preserveModules: false,
        output: {
            dir: 'esm',
            format: 'esm'
        }
    }
]