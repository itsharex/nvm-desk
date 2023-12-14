import { build } from 'electron-builder'
import rimraf from 'rimraf'
import { resolve } from 'node:path'

function cleanDist() {
    rimraf.sync(resolve(__dirname, '../dist'))

    console.log('Cleaned build artifacts.')
}

function run() {
    build({
        artifactName: '${productName}_${version}.${ext}',
        appId: 'com.nvm.desk',
        productName: 'nvm-desk',
        directories: {
            buildResources: 'assets',
            output: 'release/${version}'
        },
        files: [
            'dist'
        ],
        extraResources: [
            {
                from: 'libs/nvm.exe',
                to: 'libs/nvm.exe'
            }
        ],
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
    })
}

cleanDist()
run()
