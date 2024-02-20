// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Axios from 'axios'
import store from '@/store'
import apiConfig from '../config/api.config'
import espLeft from '@/components/left'
import espCheckbox from '@/components/espCheckbox'
import espColgroup from '@/components/espColgroup'
import espTable from '@/components/espTable'
import notify from './instance/notify'
import espLoading from './instance/loading'
import { initWs } from '@/assets/js/common'
import VueSlider from 'vue-slider-component'
import vSelect from 'vue-select'
import 'vue-slider-component/theme/default.css'
import 'vue-select/dist/vue-select.css'
import './assets/css/font.css'
import './assets/css/global.less'

Vue.component('espLeft', espLeft)
Vue.component('espCheckbox', espCheckbox)
Vue.component('espColgroup', espColgroup)
Vue.component('espTable', espTable)
Vue.component('VueSlider', VueSlider)
Vue.component('v-select', vSelect)
Vue.config.productionTip = false
Axios.defaults.timeout = 30000
Vue.use(notify)
Vue.use(espLoading)
Axios.defaults.baseURL = apiConfig.baseURL
window.$baseURL = apiConfig.baseURL
Axios.defaults.headers.post['Content-Type'] = 'application/json'
window.$axios = Axios
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  mounted () {
    this.$nextTick(() => {
      initWs()
    })
  }
})
