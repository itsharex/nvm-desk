import { createApp, provide } from 'vue'
import { Quasar } from 'quasar'

import './assets/style/style.sass'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'

const app = createApp(App)

app.use(Quasar, {
    config: {
        dark: false
    },
    plugins: {}
})

app.mount('#app')


window.electronAPI.receive('setPlatform', (evt, os) => {
    app.config.globalProperties.$isDarwin = os === 'darwin'
})
