const {build, Platform} = require('electron-builder')
const {rimrafSync} = require('rimraf')
const {resolve} = require('path')

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
                ],
                icon: './src/assets/img/favicon.ico'
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
