import {
  HOST_IP, SEND_URL, BEACON_FUNC, LOG_INFO, LOG_INFO_TEXT,
  LOG_WARNING, LOG_WARNING_TEXT, LOG_ERROR, LOG_ERROR_TEXT } from './constant'
import store from '@/store'
let WEBSOCKET
const httpGet = (url, data) => {
  return new Promise((resolve, reject) => {
    window.$axios.get(url, {params: data}).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  })
}
const httpPost = (url, data) => {
  return new Promise((resolve, reject) => {
    window.$axios({
      url: url,
      method: 'post',
      data: data,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  })
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const isEmpty = str => {
  if (str === '' || str === '""' || str === "''" || str === null || str === undefined || str === 'null' || str === 'undefined') {
    return true
  }
  return false
}
const getDate = time => {
  let date = isEmpty(time) ? new Date() : new Date(time.toString())
  return `${date.getFullYear()}-${formatNumber(date.getMonth() + 1)}-${formatNumber(date.getDate())} ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}:${formatNumber(date.getMilliseconds())}`
}
const initWs = () => {
  try {
    if (WEBSOCKET) {
      WEBSOCKET.close()
    }
    if (window.WebSocket) {
      WEBSOCKET = new WebSocket(
        encodeURI(`ws://${HOST_IP}:80/debug/recv`))
      WEBSOCKET.onopen = () => {
        console.log('connected')
        WEBSOCKET.send('Trigger async')
        getDeviceList()
        // setInterval(() => {
        //   keepalive(WEBSOCKET)
        // }, 60000)
      }
      WEBSOCKET.onerror = () => {
        console.log('Error occurred in the connection')
        setTimeout(() => {
          initWs()
        }, 20000)
      }
      WEBSOCKET.onclose = () => {
        console.log('Has been disconnected')
      }
      // Message receiving
      WEBSOCKET.onmessage = (res) => {
        try {
          res = res?.data
          if (res) {
            res = JSON.parse(res)
            if (res?.tag?.indexOf(BEACON_FUNC) === 0) {
              setDeviceList(res)
            } else {
              setDeviceLogs(res)
            }
          }
        } catch (e) {
          console.log('error', e)
        }
      }
      return WEBSOCKET
    } else {
      alert('The browser does not support WebSocket')
    }
  } catch (e) {
    console.log(e)
  }
}
const setDeviceList = (res) => {
  let data = res?.data?.split(',')
  let device = {}
  data.forEach(item => {
    let obj = item?.trim()?.split(':')
    if (obj[0]) {
      device[obj[0]?.trim()] = obj[1]?.trim()
    }
  })
  delete res.data
  device = {...res, ...device}
  let list = store.state.deviceList
  let index = list.findIndex(item => item?.src_addr === device?.src_addr)
  if (index !== -1) {
    list.splice(index, 1, device)
  } else {
    list.push(device)
  }
  let deviceInfo = store.state.deviceInfo
  if (Object.keys(deviceInfo).length > 0 && device?.src_addr === deviceInfo?.src_addr) {
    store.commit('setDeviceInfo', device)
  }
  store.commit('setDeviceList', list)
}
const setDeviceLogs = (res) => {
  console.log(res)
  let logList = store.state.logList
  let index = logList.findIndex(item => item?.src_addr === res?.src_addr)
  res.data = getLogLevel(res)
  if (index !== -1) {
    let log = logList[index]
    log.list.push(res)
  } else {
    logList.push({src_addr: res['src_addr'], list: [res]})
  }
  store.commit('setLogList', logList)
}
const getLogLevel = (item) => {
  let level = LOG_INFO_TEXT
  switch (item['log_level']) {
    case LOG_INFO:
      level = LOG_INFO_TEXT
      break
    case LOG_WARNING:
      level = LOG_WARNING_TEXT
      break
    case LOG_ERROR:
      level = LOG_ERROR_TEXT
      break
    default:
      level = LOG_INFO_TEXT
      break
  }
  return {times: getCurDate(), level: level, data: item.data}
}
const getCurDate = () => {
  let date = new Date()
  return `${date.getFullYear()}.${formatNumber(date.getMonth() + 1)}.${formatNumber(date.getDate())} ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}:${formatNumber(date.getMilliseconds())}`
}
const getDeviceList = () => {
  let data = 'command "ff:ff:ff:ff:ff:ff" "beacon"'
  httpPost(SEND_URL, data).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const getDeviceInfo = (mac) => {
  let data = `command "${mac}" "beacon"`
  httpPost(SEND_URL, data).then(res => {
    // console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const getLog = macs => {
  let data = `command "${macs.join(',')}" "log -m espnow -t * -l info"`
  httpPost(SEND_URL, data).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const getLogConfig = (macs) => {
  let data = `command "${macs.join(',')}" "log -s"`
  return new Promise((resolve, reject) => {
    httpPost(SEND_URL, data).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  })
}
const setLogConfig = (level, mode, tag, macs) => {
  let data = [`command "${macs.join(',')}" "log `]
  if (!isEmpty(tag)) {
    data.push(`-t ${tag} `)
  }
  if (!isEmpty(level)) {
    data.push(`-l ${level} `)
  }
  if (!isEmpty(mode)) {
    data.push(`-m ${mode} `)
  }
  if (data.length > 1) {
    let len = data.length - 1
    data[len] = data[len].trim()
    data.push('"')
    data = data.join('')
    httpPost(SEND_URL, data).then(res => {
      console.log(res)
    }).catch(e => {
      console.log(e)
    })
  }
}
const sendBind = () => {
  return new Promise((resolve, reject) => {
    let data = 'control -b 3'
    httpPost(SEND_URL, data).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  })
}
const sendControl = (retransmitCount, forwardTtl, forwardRssi, ack, filterWeakSignal, status, filterAdjacentChannel) => {
  return new Promise((resolve, reject) => {
    let data = ['control ']
    console.log(status)
    if (status === 2) {
      data.push('-c "3 2 1"')
    } else if (status === 1) {
      data.push('-c "3 1 1"')
    } else if (status === 0) {
      data.push('-c "3 1 0"')
    }
    if (retransmitCount && retransmitCount !== 0) {
      data.push(` --broadcast ${retransmitCount}`)
    }
    if (forwardTtl && forwardTtl !== 0) {
      data.push(` --forward_ttl ${forwardTtl}`)
    }
    if (forwardRssi && forwardRssi !== 0) {
      data.push(` --forward_rssi ${forwardRssi}`)
    }
    if (filterWeakSignal && filterWeakSignal === 1) {
      data.push(` --filter_weak_signal ${filterWeakSignal}`)
    }
    if (filterAdjacentChannel && filterAdjacentChannel === 1) {
      data.push(` --filter_adjacent_channel ${filterAdjacentChannel}`)
    }
    httpPost(SEND_URL, data.join('')).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  })
}
const getRestart = macs => {
  let data = `command "${macs.join(',')}" "restart -n"`
  httpPost(SEND_URL, data).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const getMemory = macs => {
  let data = `command "${macs.join(',')}" "heap"`
  httpPost(SEND_URL, data).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const resetDevice = macs => {
  let data = `command "${macs.join(',')}" "reset"`
  httpPost(SEND_URL, data).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const rebootDevice = macs => {
  let data = `command "${macs.join(',')}" "restart"`
  httpPost(SEND_URL, data).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const otaDevice = macs => {
  let data = `command "${macs.join(',')}" "ota"`
  httpPost(SEND_URL, data).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const otaBackDevice = macs => {
  let data = `command "${macs.join(',')}" "fallback"`
  httpPost(SEND_URL, data).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const setWifiConfig = (macs, channel, country, mode, ssid, bssid, password) => {
  let data = [`command "${macs.join(',')}" "wifi_config `]
  if (!isEmpty(country)) {
    data.push(`-C ${country} `)
  }
  if (!isEmpty(channel)) {
    data.push(`-c ${channel} `)
  }
  if (!isEmpty(mode)) {
    data.push(`-m ${mode} `)
  }
  if (!isEmpty(ssid)) {
    data.push(`-s ${ssid} `)
  }
  if (!isEmpty(bssid)) {
    data.push(`-b ${bssid} `)
  }
  if (!isEmpty(password)) {
    data.push(`-p ${password} `)
  }
  if (data.length > 1) {
    let len = data.length - 1
    data[len] = data[len].trim()
    data.push('"')
    data = data.join('')
    httpPost(SEND_URL, data).then(res => {
      console.log(res)
    }).catch(e => {
      console.log(e)
    })
  }
}
const sendCustomCommand = (macs, command) => {
  let data = `command "${macs.join(',')}" "${command}"`
  httpPost(SEND_URL, data).then(res => {
    console.log(res)
  }).catch(e => {
    console.log(e)
  })
}
const configCommand = (macs, command) => {
  return new Promise((resolve, reject) => {
    let data = `command "${macs.join(',')}" "${command}"`
    httpPost(SEND_URL, data).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  })
}
const exportData = (list) => {
  list.forEach(item => {
    var blob = new Blob([item.logs.join('\r\n')], { type: 'application/txt' })
    // 判断ie
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, `${item['mac']}.txt`)
    } else {
      var a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${item['mac']}.txt`
      document.body.appendChild(a)
      a.onclick = function () {
        // document.body.removeChild(a)
      }
      a.click()
    }
  })
}
const exportLog = list => {
  let logList = []
  list.forEach(item => {
    let obj = {mac: item['src_addr'], logs: []}
    item.list.forEach(log => {
      let data = log?.data || {}
      obj.logs.push(`${data?.times || ''} ${data?.level || ''} ${log.tag} ${data?.data || ''}`)
    })
    logList.push(obj)
  })
  console.log(logList)
  exportData(logList)
}
const getAPPVersions = (list) => {
  let appVersions = []
  list.forEach(item => {
    if (!appVersions.includes(item['app_version'])) {
      appVersions.push(item['app_version'])
    }
  })
  return appVersions
}
const hsv2rgb = (h, s, v) => {
  let i = Math.floor(h * 6)
  let f = h * 6 - i
  let [r, g, b, p, q, t] = [0, 0, 0, v * (1 - s), v * (1 - f * s), v * (1 - (1 - f) * s)]
  switch (i % 6) {
    case 0:
      [r, g, b] = [v, t, p]
      break
    case 1:
      [r, g, b] = [q, v, p]
      break
    case 2:
      [r, g, b] = [p, v, t]
      break
    case 3:
      [r, g, b] = [p, q, v]
      break
    case 4:
      [r, g, b] = [t, p, v]
      break
    case 5:
      [r, g, b] = [v, p, q]
      break
  }
  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)]
}
const initData = (list) => {
  let obj = {}
  let curTime = ''
  list.forEach(item => {
    let date = new Date(item)
    let time = `${date.getFullYear()}.${formatNumber(date.getMonth() + 1)}.${formatNumber(date.getDate())}\n${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}:00`
    if (curTime !== time) {
      obj[time] = 1
      curTime = time
      return
    }
    obj[time]++
  })
  return obj
}
export {
  httpGet,
  httpPost,
  formatNumber,
  getDate,
  isEmpty,
  initWs,
  getDeviceList,
  getDeviceInfo,
  getLog,
  getRestart,
  getMemory,
  resetDevice,
  rebootDevice,
  otaDevice,
  otaBackDevice,
  setWifiConfig,
  sendCustomCommand,
  configCommand,
  exportData,
  exportLog,
  getLogConfig,
  setLogConfig,
  getAPPVersions,
  hsv2rgb,
  sendBind,
  sendControl,
  initData
}
