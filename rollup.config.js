import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve'
import ignore from 'rollup-plugin-ignore'
import inject from '@rollup/plugin-inject'
import path from 'path'
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

export default [
    {
        input: `src/GraphEditor.ts`,
        output: [
            {
                file: 'umd/graph-editor.js',
                name: 'GraphEditor',
                format: 'iife',
                sourcemap: false,
                freeze: false,
                banner: `/*!
                * GraphEditor v${pkg.version}
                * (c) ${new Date().getFullYear()} Zhang Na
                * License: MIT
                */`
            }
        ],
        plugins: [
            ignore(['canvas']),
            nodeResolve(),
            commonjs(),
            typescript(),
            replace({
                delimiters: ['', ''],
                '__VERSION__': pkg.version
              })
        ],
    },
    {
        input: `src/GraphViewer.ts`,
        output: [
            {
                file: 'umd/graph-viewer.js',
                name: 'GraphViewer',
                format: 'iife',
                sourcemap: false,
                freeze: false,
                banner: `/*!
                * GraphViewer v${pkg.version}
                * (c) ${new Date().getFullYear()} Zhang Na
                * License: MIT
                */`
            }
        ],
        plugins: [
            ignore(['canvas']),
            nodeResolve(),
            commonjs(),
            typescript(),
            replace({
                delimiters: ['', ''],
                '__VERSION__': pkg.version
              })
        ],
    },
    {
        input: `src/index.all.ts`,
        output: [
            {
                file: 'umd/graph-editor-core.js',
                name: 'Giraffe',
                format: 'iife',
                sourcemap: false,
                freeze: false,
                banner: `/*!
                * Giraffe v${pkg.version}
                * (c) ${new Date().getFullYear()} Zhang Na
                * License: MIT
                */`
            }
        ],
        plugins: [
            ignore(['canvas']),
            nodeResolve(),
            commonjs(),
            typescript(),
            replace({
                delimiters: ['', ''],
                '__VERSION__': pkg.version
              })
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