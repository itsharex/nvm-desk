import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import {quasar, transformAssetUrls} from '@quasar/vite-plugin';

export default defineConfig(async () => ({
    plugins: [
        vue({
            template: {transformAssetUrls}
        }),
        quasar({
            sassVariables: 'src/assets/style/quasar-variable.sass'
        })
    ],
    clearScreen: false,
    server: {
        port: 1420,
        strictPort: true,
    }
}));
