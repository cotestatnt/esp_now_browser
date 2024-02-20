import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    deviceList: [],
    deviceInfo: {},
    logList: [],
    deviceInfoMac: ''
  },
  mutations: {
    setDeviceList (state, deviceList) {
      state.deviceList = deviceList
    },
    setLogList (state, logList) {
      state.logList = logList
    },
    setDeviceInfo (state, deviceInfo) {
      state.deviceInfo = deviceInfo
    },
    setDeviceInfoMac (state, deviceInfoMac) {
      state.deviceInfoMac = deviceInfoMac
    }
  }
})
