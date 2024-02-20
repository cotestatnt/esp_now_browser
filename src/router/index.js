import Vue from 'vue'
import Router from 'vue-router'
import index from '@/pages/index'
import deviceInfo from '@/pages/deviceInfo'
import devices from '@/pages/devices'
import control from '@/pages/control'
import wifi from '@/pages/wifi'
import test from '@/pages/test'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/deviceInfo',
      name: 'deviceInfo',
      component: deviceInfo
    },
    {
      path: '/ota',
      name: 'ota',
      component: devices
    },
    {
      path: '/control',
      name: 'control',
      component: control
    },
    {
      path: '/wifi',
      name: 'wifi',
      component: wifi
    },
    {
      path: '/test',
      name: 'test',
      component: test
    }
  ]
})
