import { build, Platform } from 'electron-builder'
import {rimrafSync} from 'rimraf'
import { resolve } from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = fileURLToPath(new URL(".", import.meta.url))

function cleanDist() {
    rimrafSync(resolve(__dirname, '../release'))

    console.log('Cleaned build artifacts.')
}

function run() {
    build({
        targets: Platform.WINDOWS.createTarget(),
        config: {
            artifactName: '${productName}_${version}.${ext}',
            appId: 'com.nvm.desk',
            productName: 'nvm-desk',
            directories: {
                buildResources: 'assets',
                output: 'release'
            },
            files: [
                'dist'
            ],
            // extraResources: [
            //     {
            //         from: 'libs/nvm.exe',
            //         to: 'libs/nvm.exe'
            //     }
            // ],
            win: {
                target: [
                    {
                        target: 'nsis',
                        arch: ['x64']
                    }
                ]
            },
            nsis: {
                oneClick: false,
                perMachine: false,
                allowToChangeInstallationDirectory: true,
                deleteAppDataOnUninstall: true,
                packElevateHelper: false,
                include: 'build/installer.nsh'
            }
        }

    }).then(r => console.log(r))
}

cleanDist()
run()
