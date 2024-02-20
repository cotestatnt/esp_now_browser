<template>
  <div class="main-wrap home-wrap">
    <div class="header">
      <div class="info">
        <div class="desc">
          <p>Welcome to use esp-now system!</p>
          <p>{{ time }}</p>
        </div>
        <div class="flex flex-ac">
          <div class="item crash-wrap">
            <div class="icon-wrap">
              <img src="../assets/imgages/CRASH.svg">
            </div>
            <div class="content">
              <p class="title">CRASH</p>
              <p class="num">{{crashList.length}}</p>
            </div>
          </div>
          <div class="item reboot-wrap">
            <div class="icon-wrap">
              <img src="../assets/imgages/REBOOT.svg">
            </div>
            <div class="content">
              <p class="title">REBOOT</p>
              <p class="num">{{rebootList.length}}</p>
            </div>
          </div>
          <div class="item warning-wrap">
            <div class="icon-wrap">
              <img src="../assets/imgages/WARNING.svg">
            </div>
            <div class="content">
              <p class="title">WARNING</p>
              <p class="num">{{warningList.length}}</p>
            </div>
          </div>
          <div class="item error-wrap">
            <div class="icon-wrap">
              <img src="../assets/imgages/ERROR.svg">
            </div>
            <div class="content">
              <p class="title">ERROR</p>
              <p class="num">{{errorList.length}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="table">
      <h3 class="name flex flex-ac flex-jcs">
        <span>设备列表</span>
        <div class="filter-wrap">
          <div class="search-item">
            <v-select @input="selectAppVersion"  :options="appVersions" v-model="searchName"></v-select>
          </div>
        </div>
      </h3>
      <div class="info">
        <div class="btn-wrap">
          <button @click="getDeviceList" class="btn">刷新列表</button>
          <button @click="showLog" :class="{'active': isShowLog}" class="btn">日志配置</button>
          <button @click="showStatistic" class="btn" :class="{'active': isShowStatistics}">日志分析</button>
          <button @click="showModal(COMMAND_EXPORT)" class="btn">日志导出</button>
          <span class="line"></span>
          <button @click="showModal(COMMAND_RESET)" class="btn">设备重置</button>
          <button @click="showModal(COMMAND_REBOOT)" class="btn">设备重启</button>
          <button @click="showModal(COMMAND_WIFI_CONFIG)" class="btn">Wi-Fi 配置</button>
          <button @click="configCommand(COMMAND_WIFI_INFO)" class="btn">Wi-Fi 信息</button>
<!--          <button @click="configCommand(COMMAND_VERSION)" class="btn">GPIO</button>-->
<!--          <button @click="configCommand(COMMAND_VERSION)" class="btn">UART</button>-->
          <button @click="configCommand(COMMAND_HEAP)" class="btn">内存使用</button>
          <button @click="showModal(COMMAND_CUSTOM)" class="btn">自定义命令</button>
        </div>
        <esp-table ref="deviceListTable" @selection-change="selectDevice" :th-headers="thHeaders" :data="filterList">
          <template slot-scope="scope">
            <span @click="showInfo(scope.row)" class="btn-mini">详情</span>
          </template>
        </esp-table>
      </div>
    </div>
    <div v-if="isShowStatistics" class="statistics">
      <h3 class="name">数据统计</h3>
      <div class="info">
        <canvas id="echarts"></canvas>
      </div>
    </div>
    <div v-show="isShowLog" class="log">
      <h3 class="name flex flex-ac flex-jcs">
        <span>日志展示</span>
        <div class="operate-wrap"><span v-if="getOperateClass(index)" @click="selectLayout(icon.id)" :class="{'active': layout === icon.id}" :key="icon.id" v-for="(icon, index) in layoutList"><i :class="icon.icon"  class="iconfont"></i></span></div>
      </h3>
      <div class="info">
        <div :class="getLayoutClass()" class="item-wrap" :key="item['src_addr']" v-for="(item, index) in filterLogs">
          <div class="item">
            <div class="header">
              <p><span class="title">{{item['src_addr']}}</span><span class="num">({{item.list.length}}条日志)</span><span @click="showExportLog([item])" class="export">导出</span></p>
              <i @click="deleteLog(index, item['src_addr'])" class="iconfont icon-error"></i>
            </div>
            <div class="body">
              <div class="content">
                <div class="item-log item-header">
                  <div class="item-log-time">时间</div>
                  <div class="item-log-level" :class="{'active': filterLogLevel[item['src_addr']] && filterLogLevel[item['src_addr']][log_level].length > 0}">类型<i @click.stop="showFilter(item['src_addr'])" class="iconfont icon-left"></i>
                    <div :ref="`${item['src_addr']}-level`" style="display: none" class="ul-wrap">
                      <ul>
                        <li @click.stop="selectLogLevel(label, item['src_addr'])" :class="{'active': filterLogLevel[item['src_addr']] && filterLogLevel[item['src_addr']][log_level].includes(label)}" :key="label" v-for="label in select_list">{{label}}</li>
                      </ul>
                    </div>
                  </div>
                  <div class="item-log-tag">标签</div>
                  <div class="item-log-data">日志</div>
                </div>
                <div class="item-log-wrap" :ref="item['src_addr']">
                  <div class="item-log" :key="index" v-for="(item, index) in getFilterLogList(item.list)">
                    <div class="item-log-time">{{item.data.times}}</div>
                    <div class="item-log-level"><span :class="getLogLevelClass(item)">{{item.data.level}}</span></div>
                    <div class="item-log-tag ellipsis" :title="item.tag">{{item.tag || '--'}}</div>
                    <div class="item-log-data">{{item.data.data}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="isShowModal" class="operate-modal-wrap" :class="{'operate-textarea-modal-wrap': operateType === COMMAND_CUSTOM}">
      <div @click="isShowModal=false" class="mask"></div>
      <div class="content">
        <h3>{{title}}</h3>
        <div v-if="operateType === COMMAND_CUSTOM" class="textarea-wrap">
          <textarea class="form-textarea" v-model="customCommand"></textarea>
        </div>
        <p v-else>{{modeText}}</p>
        <div class="btn-wrap">
          <button @click="isShowModal=false" class="btn btn-danger">取消</button>
          <button @click="operateEvent" class="btn">{{operateType === COMMAND_CUSTOM ? '发送' : '确定'}}</button>
        </div>
      </div>
    </div>
    <div v-show="isShowWifiModal" class="operate-modal-wrap operate-modal-mini-wrap">
      <div @click="isShowWifiModal=false" class="mask"></div>
      <div class="content">
        <h3>Wi-Fi 配置</h3>
        <div class="item-wrap wifi-config-wrap">
          <div class="item">
            <label>国家：</label>
            <div class="input-wrap">
              <v-select @input="changeCountry" :options="countryCodeList" v-model="countryCode"></v-select>
            </div>
          </div>
          <div class="item">
            <label>信道：</label>
            <div class="input-wrap">
              <v-select :options="getChannelList()" v-model="channel"></v-select>
            </div>
          </div>
          <div class="item">
            <label>模式：</label>
            <div class="input-wrap">
              <v-select :options="wifiModeList" v-model="wifiMode"></v-select>
            </div>
          </div>
          <div class="item">
            <label>SSID：</label>
            <div class="input-wrap">
              <input class="form-control" v-model="ssid" >
            </div>
          </div>
          <div class="item">
            <label>BSSID：</label>
            <div class="input-wrap">
              <input class="form-control" v-model="bssid" >
            </div>
          </div>
          <div class="item">
            <label>密码：</label>
            <div class="input-wrap">
              <input class="form-control" v-model="password" >
            </div>
          </div>
        </div>
        <div class="btn-wrap">
          <button @click="isShowWifiModal=false" class="btn btn-danger">取消</button>
          <button @click="setWifiConfig" class="btn">确定</button>
        </div>
      </div>
    </div>
    <div v-show="isShowLogModal" class="operate-modal-wrap operate-modal-mini-wrap">
      <div @click="isShowLogModal=false" class="mask"></div>
      <div class="content">
        <h3>日志配置</h3>
        <div class="item-wrap wifi-config-wrap">
          <div class="item">
            <label>传输方式：</label>
            <div class="input-wrap">
              <v-select :options="logModeList" v-model="logMode"></v-select>
            </div>
          </div>
          <div class="item">
            <label>日志模块：</label>
            <div class="input-wrap">
              <input class="form-control" v-model="logTag" >
            </div>
          </div>
          <div class="item">
            <label>日志等级：</label>
            <div class="input-wrap">
              <div class="input-wrap">
                <v-select :options="logLevelList" v-model="logLevel"></v-select>
              </div>
            </div>
          </div>
        </div>
        <div class="btn-wrap">
          <button @click="isShowLogModal=false" class="btn btn-danger">取消</button>
          <button @click="setLogConfig" class="btn">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  formatNumber, getDeviceList, getLog, setLogConfig,
  resetDevice, rebootDevice, setWifiConfig,
  sendCustomCommand, configCommand, isEmpty, exportLog,
  getAPPVersions, initData } from '@/assets/js/common.js'
import {
  LOG_LEVEL, LOG_ERROR, LOG_INFO, LOG_WARNING, LOG_INFO_TEXT,
  LOG_WARNING_TEXT, LOG_ERROR_TEXT, COMMAND_RESET,
  COMMAND_WIFI_CONFIG, COMMAND_CUSTOM, COUNTTRY_CODE_LIST,
  COMMAND_REBOOT, CHANNEL_LIST, FILE_BIN_TYPE, POWERON_RESET,
  RTCWDT_RTC_RESET, DEEPSLEEP_RESET, RTCWDT_BROWN_OUT_RESET,
  RESTART_FUNC, COMMAND_EXPORT, COUNTRY_CODE_CN,
  COUNTRY_CODE_US, TH_HEADERS, WIFI_MODE_LIST,
  COMMAND_WIFI_INFO, COMMAND_VERSION, COMMAND_HEAP
} from '../assets/js/constant'
let myCharts = ''
let timerBarId = ''
export default {
  name: 'index',
  data () {
    return {
      log_error: LOG_ERROR,
      log_info: LOG_INFO,
      log_warn: LOG_WARNING,
      log_level: LOG_LEVEL,
      COMMAND_RESET: COMMAND_RESET,
      COMMAND_WIFI_CONFIG: COMMAND_WIFI_CONFIG,
      COMMAND_CUSTOM: COMMAND_CUSTOM,
      COMMAND_EXPORT: COMMAND_EXPORT,
      COMMAND_REBOOT: COMMAND_REBOOT,
      COMMAND_WIFI_INFO: COMMAND_WIFI_INFO,
      COMMAND_VERSION: COMMAND_VERSION,
      COMMAND_HEAP: COMMAND_HEAP,
      layoutList: [{id: 1, icon: 'icon-one'}, {id: 2, icon: 'icon-two'}, {id: 3, icon: 'icon-three'}, {id: 4, icon: 'icon-four'}],
      layout: 2,
      searchName: '',
      title: '设备升级',
      winWidth: 1170,
      thHeaders: TH_HEADERS,
      select_list: [LOG_INFO_TEXT, LOG_WARNING_TEXT, LOG_ERROR_TEXT],
      deviceList: [],
      value: '',
      crashList: [],
      rebootList: [],
      errorList: [],
      warningList: [],
      infoList: [],
      time: '',
      selectMacs: [],
      logList: [],
      isShowLog: false,
      isShowStatistics: false,
      barWidth: 20,
      filterLogLevel: {},
      isShowModal: false,
      operateType: '',
      fileName: '',
      isShowWifiModal: false,
      countryCodeList: COUNTTRY_CODE_LIST,
      channelList: CHANNEL_LIST,
      wifiModeList: WIFI_MODE_LIST,
      COUNTRY_CODE_CN: COUNTRY_CODE_CN,
      COUNTRY_CODE_US: COUNTRY_CODE_US,
      customCommand: '',
      countryCode: '',
      channel: '',
      ssid: '',
      bssid: '',
      password: '',
      wifiMode: '',
      appVersions: [],
      isShowExport: false,
      isShowLogModal: false,
      logLevelList: ['none', 'err', 'warn', 'info', 'debug', 'ver'],
      logModeList: ['uart', 'flash', 'espnow', 'custom'],
      logFlashList: ['size', 'data', 'espnow'],
      isShowLogLevel: false,
      logLevel: 'info',
      logMode: 'espnow',
      isShowLogFlash: false,
      logFlash: '',
      logTag: '*',
      modeText: '',
      colorList: ['#ff0000', '#66a3fe', '#58d4e5', '#ff976a', '#ff5928'],
      barData: {date: [], crash: [], reboot: [], warning: [], error: [], info: []}
    }
  },
  beforeDestroy () {
    if (timerBarId) {
      clearTimeout(timerBarId)
    }
  },
  computed: {
    filterList () {
      const self = this
      let list = self.$store.state.deviceList
      list = list.filter(item => {
        if (item['project_name']?.indexOf(self.searchName) !== -1 ||
          item['src_addr']?.indexOf(self.searchName) !== -1 ||
          item['app_version']?.indexOf(self.searchName) !== -1 ||
          self.searchName === '') {
          return item
        }
      })
      self.deviceList = list
      self.appVersions = getAPPVersions(list)
      return self.deviceList
    },
    filterLogs () {
      const self = this
      self.logList = self.$store.state.logList
      self.warningList = []
      self.errorList = []
      self.rebootList = []
      self.crashList = []
      self.infoList = []
      self.logList.forEach(item => {
        let mac = item['src_addr']
        let obj = {}
        obj[LOG_LEVEL] = []
        if (!self.filterLogLevel[mac]) {
          self.filterLogLevel[mac] = obj
        }
        self.getLevelList(item.list)
      })
      if (self.logList.length > 0) {
        self.isShowLog = true
      }
      self.setScroll()
      return self.logList
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.getTime()
      document.addEventListener('click', () => {
        let uls = document.querySelectorAll('.log .ul-wrap')
        for (let i = 0; i < uls.length; i++) {
          uls[i].style.display = 'none'
        }
      })
    })
    this.winWidth = window.innerWidth
    window.addEventListener('resize', () => {
      this.winWidth = window.innerWidth
    })
  },
  methods: {
    getChannelList () {
      let list = []
      if (this.countryCode.value === COUNTRY_CODE_CN) {
        list = this.channelList.filter(item => item.value === '' || parseInt(item.value) < 14)
      } else if (this.countryCode.value === COUNTRY_CODE_US) {
        list = this.channelList.filter(item => item.value === '' || parseInt(item.value) < 12)
      } else {
        list = this.channelList
      }
      return list
    },
    showModal (type) {
      if (this.selectMacs.length === 0) {
        this.$notify({ type: 'warning', message: '请选择设备' })
        return
      }
      this.operateType = type
      if (this.operateType === COMMAND_WIFI_CONFIG) {
        this.isShowWifiModal = true
        return
      }
      this.isShowModal = true
      if (this.operateType === COMMAND_RESET) {
        this.title = '设备重置'
        this.modeText = '确定要重置选中的设备吗？'
        return
      }
      if (this.operateType === COMMAND_REBOOT) {
        this.title = '设备重启'
        this.modeText = '确定要重启选中的设备吗？'
        return
      }
      if (this.operateType === COMMAND_CUSTOM) {
        this.title = '自定义命令'
        return
      }
      if (this.operateType === COMMAND_EXPORT) {
        this.title = '日志导出'
        this.modeText = '确定要导出选中的设备日志吗？'
      }
    },
    selectAppVersion (name) {
      this.searchName = name
    },
    configCommand (type) {
      if (this.selectMacs.length === 0) {
        this.$notify({ type: 'warning', message: '请选择设备' })
        return
      }
      this.$loading.show()
      let command = ''
      if (type === COMMAND_WIFI_INFO) {
        command = 'wifi_config -i'
      } else if (type === COMMAND_VERSION) {
        command = 'version'
      } else if (type === COMMAND_HEAP) {
        command = 'heap'
      }
      configCommand(this.selectMacs, command).then(res => {
        console.log(res)
        this.$loading.hide()
        this.$notify({ type: 'success', message: '发送成功' })
      }).catch(err => {
        console.log(err)
        this.$loading.hide()
        this.$notify({ type: 'error', message: '发送失败' })
      })
    },
    operateEvent () {
      if (this.operateType === COMMAND_CUSTOM && isEmpty(this.customCommand)) {
        this.$notify({ type: 'warning', message: '请输入自定义命令' })
        return
      }
      console.log(this.operateType, COMMAND_RESET)
      if (this.operateType === COMMAND_RESET) {
        resetDevice(this.selectMacs)
        this.isShowModal = false
        return
      }
      if (this.operateType === COMMAND_REBOOT) {
        rebootDevice(this.selectMacs)
        this.isShowModal = false
        return
      }
      if (this.operateType === COMMAND_CUSTOM) {
        sendCustomCommand(this.selectMacs, this.customCommand)
        return
      }
      if (this.operateType === COMMAND_EXPORT) {
        this.isShowModal = false
        let list = this.logList.filter(item => this.selectMacs.includes(item['src_addr']))
        this.showExportLog(list)
      }
    },
    showExportLog (list) {
      exportLog(list)
    },
    setWifiConfig () {
      this.isShowWifiModal = false
      setWifiConfig(this.selectMacs, this.channel, this.countryCode.value, this.wifiMode.value, this.ssid, this.bssid, this.password)
    },
    getFile () {
      try {
        let file = this.$refs.file.files[0]
        if (file.type !== FILE_BIN_TYPE) {
          this.$refs.file.value = ''
          this.$notify({ type: 'warning', message: '请选择 Bin 文件' })
          return
        }
        this.fileName = file.name
      } catch (e) {
      }
    },
    changeCountry () {
      if (this.countryCode.value === COUNTRY_CODE_CN && parseInt(this.channel.value) >= 14) {
        this.channel = CHANNEL_LIST?.[13] || ''
        return
      }
      if (this.countryCode.value === COUNTRY_CODE_US && parseInt(this.channel.value) >= 12) {
        this.channel = CHANNEL_LIST?.[11] || ''
      }
    },
    showInfo (item) {
      if (item) {
        this.$store.commit('setDeviceInfo', item)
        this.$router.push({
          path: '/deviceInfo'
        })
      }
    },
    setScroll () {
      const self = this
      setTimeout(() => {
        for (let item of Object.values(self.$refs)) {
          item = item[0]
          if (item) {
            item.scrollTop = item.scrollHeight
          }
        }
      })
    },
    getDeviceList () {
      getDeviceList()
    },
    showFilter (mac) {
      if (mac) {
        this.$refs[`${mac}-level`][0].style.display = 'block'
      }
    },
    selectLayout (id) {
      this.layout = id
    },
    getLayoutClass () {
      switch (this.layout) {
        case 1:
          return 'col-1'
        case 2:
          return 'col-2'
        case 3:
          return 'col-3'
        case 4:
          return 'col-4'
        default:
          return 'col-3'
      }
    },
    selectLogLevel (label, mac) {
      if (mac) {
        let logLevels = this.filterLogLevel[mac][LOG_LEVEL] || []
        let index = logLevels.indexOf(label)
        if (index !== -1) {
          logLevels.splice(index, 1)
        } else {
          logLevels.push(label)
        }
        this.filterLogLevel[mac][LOG_LEVEL] = logLevels
      }
    },
    getLevelList (list) {
      const self = this
      list.forEach(item => {
        let times = item?.data?.times || ''
        if (item?.tag === RESTART_FUNC) {
          let obj = item?.data?.data
          if (obj) {
            let newObj = {}
            let objs = obj.split(',')
            objs.forEach(item => {
              item = item.split(':')
              if (item.length > 1) {
                newObj[item[0].trim()] = item[1].trim()
              }
            })
            let reason = parseInt(newObj?.reason || 0)

            if (reason === POWERON_RESET || reason === RTCWDT_RTC_RESET ||
              reason === DEEPSLEEP_RESET || reason === RTCWDT_BROWN_OUT_RESET) {
              if (!isEmpty(times)) {
                self.rebootList.push(times)
              }
            } else {
              if (!isEmpty(times)) {
                self.crashList.push(times)
              }
            }
          }
          return
        }
        switch (item[LOG_LEVEL]) {
          case LOG_WARNING:
            if (!isEmpty(times)) {
              self.warningList.push(item?.data?.times || '')
            }
            break
          case LOG_ERROR:
            if (!isEmpty(times)) {
              self.errorList.push(item?.data?.times || '')
            }
            break
          case LOG_INFO:
            if (!isEmpty(times)) {
              self.infoList.push(item?.data?.times || '')
            }
            break
        }
      })
    },
    getTime () {
      const self = this
      let date = new Date()
      this.time = `${date.getFullYear()}年${formatNumber(date.getMonth() + 1)}月${formatNumber(date.getDate())}日 ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}`
      setTimeout(() => {
        self.getTime()
      }, 1000)
    },
    getFilterLogList (list) {
      const self = this
      list = list.filter(log => {
        try {
          let level = self.filterLogLevel[log['src_addr']][LOG_LEVEL] || []
          if (level.indexOf(log?.data['level']) !== -1 || level.length === 0) {
            return log
          }
        } catch (e) {
          console.log(e)
        }
      })
      return list
    },
    getLogLevelClass (item) {
      switch (item['log_level']) {
        case LOG_INFO:
          return 'level-info'
        case LOG_WARNING:
          return 'level-warning'
        case LOG_ERROR:
          return 'level-error'
        default:
          return 'level-info'
      }
    },
    selectDevice (macs) {
      this.selectMacs = macs
    },
    selectOperateDevice (macs) {
      this.operateMacs = macs
    },
    showStatistic () {
      const self = this
      if (self.isShowStatistics) {
        self.isShowStatistics = false
        if (timerBarId) {
          timerBarId = ''
          myCharts = ''
          clearTimeout(timerBarId)
        }
        return
      }
      if (self.logList.length === 0) {
        self.$notify({ type: 'warning', message: '暂无日志可分析' })
        return
      }
      self.isShowStatistics = true
      self.showCharts()
    },
    showCharts () {
      if (!this.isShowStatistics) {
        return
      }
      let crashObj = initData(this.crashList)
      let rebootObj = initData(this.rebootList)
      let warningObj = initData(this.warningList)
      let errorObj = initData(this.errorList)
      let infoObj = initData(this.infoList)
      let keys = Array.from([...new Set([...Object.keys(crashObj), ...Object.keys(rebootObj), ...Object.keys(warningObj), ...Object.keys(errorObj), ...Object.keys(infoObj)])]).sort()
      console.log(keys)
      for (let key of keys) {
        let index = this.barData.date.indexOf(key)
        if (index !== -1) {
          if (this.barData.crash[index] !== crashObj[key]) {
            this.barData.crash.splice(index, 1, crashObj[key] || 0)
          }
          if (this.barData.reboot[index] !== rebootObj[key]) {
            this.barData.reboot.splice(index, 1, rebootObj[key] || 0)
          }
          if (this.barData.warning[index] !== warningObj[key]) {
            this.barData.warning.splice(index, 1, warningObj[key] || 0)
          }
          if (this.barData.error[index] !== errorObj[key]) {
            this.barData.error.splice(index, 1, errorObj[key] || 0)
          }
          if (this.barData.info[index] !== infoObj[key]) {
            this.barData.info.splice(index, 1, infoObj[key] || 0)
          }
        } else {
          this.barData.date.push(key)
          this.barData.crash.push(crashObj[key] || 0)
          this.barData.reboot.push(rebootObj[key] || 0)
          this.barData.warning.push(warningObj[key] || 0)
          this.barData.error.push(errorObj[key] || 0)
          this.barData.info.push(infoObj[key] || 0)
        }
      }
      if (!myCharts) {
        this.$nextTick(() => {
          myCharts = this.initBar()
        })
      } else {
        myCharts.update()
      }
      if (this.isShowStatistics) {
        timerBarId = setTimeout(() => {
          this.showCharts()
        }, 10000)
      }
    },
    initBar () {
      let ctx = document.getElementById('echarts')
      ctx.height = 310
      // eslint-disable-next-line no-undef,no-new
      myCharts = new Chart(ctx, {
        type: 'bar',
        // color: ['#ff0000', '#66a3fe', '#58d4e5', '#ff976a', '#ff5928'],
        data: {
          labels: this.barData.date,
          datasets: [{
            label: 'Crash',
            stack: 'log',
            maxBarThickness: this.barWidth,
            backgroundColor: this.colorList[0],
            data: this.barData.crash,
            borderWidth: 1
          },
          {
            label: 'Reboot',
            stack: 'log',
            maxBarThickness: this.barWidth,
            backgroundColor: this.colorList[1],
            data: this.barData.reboot,
            borderWidth: 1
          },
          {
            label: 'Info',
            stack: 'log',
            maxBarThickness: this.barWidth,
            backgroundColor: this.colorList[2],
            data: this.barData.info,
            borderWidth: 1
          },
          {
            label: 'Warning',
            stack: 'log',
            maxBarThickness: this.barWidth,
            backgroundColor: this.colorList[3],
            data: this.barData.warning,
            borderWidth: 1
          },
          {
            label: 'Error',
            stack: 'log',
            maxBarThickness: this.barWidth,
            backgroundColor: this.colorList[4],
            data: this.barData.error,
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            },
            scales: {
              xAxes: [{
                gridLines: {
                  display: false
                }
              }],
              yAxes: [{
                gridLines: {
                  color: '#f4f7fc'
                }
              }]
            }
          },
          maintainAspectRatio: false,
          responsive: false
        }
      })
      return myCharts
    },
    showLog () {
      if (this.selectMacs.length === 0) {
        this.$notify({ type: 'warning', message: '请选择设备' })
        return
      }
      this.isShowLogModal = true
    },
    getLog () {
      this.isShowLog = true
      getLog(this.selectMacs)
    },
    setLogConfig () {
      this.isShowLogModal = false
      setLogConfig(this.logLevel, this.logMode, this.logTag, this.selectMacs)
    },
    getOperateClass (index) {
      if (this.winWidth > 2250) {
        return true
      }
      if (this.winWidth > 1720) {
        if (this.layout > 3) {
          this.layout = 3
        }
        return index < 3
      }
      if (this.winWidth > 1220) {
        if (this.layout > 2) {
          this.layout = 2
        }
        return index < 2
      }
      this.layout = 1
      return false
    },
    deleteLog (index, mac) {
      if (mac) {
        this.logList.splice(index, 1)
        this.selectMacs.splice(this.selectMacs.indexOf(mac), 1)
        if (this.logList.length === 0) {
          this.isShowLog = false
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.main-wrap {
  width: 100%;
  min-height: 100%;
  .header {
    .info {
      text-align: left;
      background: @green-color;
      border-radius: 12px;
      padding: 30px 20px;
      background-image: url("../assets/imgages/bg.png");
      background-position: bottom right;
      background-repeat: no-repeat;
      background-size: contain;
      box-sizing: border-box;
      box-shadow: 0 0 6px @green-color;
      .desc {
        margin-bottom: 30px;
        p:first-child {
          font-size: 30px;
          font-weight: bold;
        }
        p:last-child {
          margin-top: 15px;
          font-size: 16px;
          color: rgba(255,255,255,.8)
        }
      }
      p {
        margin: 0;
        line-height: 1;
        text-align: left;
        color: @white-color;
        &.title {
          font-size: 14px;
          font-weight: bold;
        }
        &.num {
          margin-top: 4px;
          font-size: 22px;
          font-weight: bold;
        }
      }
    }
    .item {
      margin-right: 60px;
      color: @white-color;
      display: flex;
      align-items: center;
      .icon-wrap {
        margin-right: 10px;
        img {
          width: 50px;
          height: auto;
        }
        .icon-crash {
          color: @red-color;
        }
        .icon-reboot {
          color: @blue-color;
        }
        .icon-warning {
          color: @yellow-color;
        }
        .icon-error {
          color: @orange-color;
        }
      }
      .content {
        padding-top: 2px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
  }
  .statistics {
    margin-top: 30px;
    .info {
      background: @white-color;
      border-radius: 12px;
      box-shadow: 0 0 6px @white-color;
      padding: 20px 15px;
      height: 350px;
      box-sizing: border-box;
    }
    #echarts {
     width: 100%;
      height: 100%;
    }
  }
  .table {
    margin-top: 30px;
    .table-content {
      max-height: 400px;
    }
  }
  .device-info-wrap {
    &.active {
      transform: translateX(0);
    }
  }
}

</style>
