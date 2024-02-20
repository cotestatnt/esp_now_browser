<template>
  <div class="main-wrap">
    <div class="device-info">
      <h3 class="name">设备信息</h3>
      <div class="info">
        <div class="content">
          <div class="item">
            <label>项目名称: </label>
            <span>{{filterInfo['project_name'] || '--'}}</span>
          </div>
          <div class="item">
            <label>项目名称: </label>
            <span>{{filterInfo['project_name'] || '--'}}</span>
          </div>
          <div class="item">
            <label>Mac 地址: </label>
            <span>{{filterInfo['src_addr'] || '--'}}</span>
          </div>
          <div class="item">
            <label>信号: </label>
            <span>{{filterInfo['rssi'] || '--'}}</span>
          </div>
          <div class="item">
            <label>应用版本: </label>
            <span>{{filterInfo['app_version'] || '--'}}</span>
          </div>
          <div class="item">
            <label>IDF 版本: </label>
            <span>{{filterInfo['esp-idf_version'] || '--'}}</span>
          </div>
          <div class="item">
            <label>编译时间: </label>
            <span>{{filterInfo['compile_time'] || '--'}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <h3 class="name">数据展示</h3>
      <div class="info">
        <div class="item">
          <div ref="canvasWrap" class="">
            <canvas id="device-info-line"></canvas>
          </div>
        </div>
        <div class="item device-info-gauge">
          <esp-gauge :value="memory" />
          <p class="desc">{{`${deviceInfo.free_heap || 0 } / ${deviceInfo.total_heap || 0 }`}}</p>
        </div>
      </div>
    </div>
    <div v-if="getNum(filterLog) > 0" class="log device-info-log">
      <h3 class="name">日志展示</h3>
      <div class="info">
        <div class="item-wrap col-1">
          <div class="item">
            <div class="header flex flex-jcs">
              <div class="flex flex-ac">
                <p><span class="title">{{filterLog['src_addr']}}</span><span class="num">({{getNum(filterLog)}}条日志)</span></p>
                <div class="header-log-level">
                  <div class="item crash-wrap">
                    <p class="title">Crash: </p>
                    <p class="num">{{crashList.length}}</p>
                  </div>
                  <div class="item reboot-wrap">
                    <p class="title">Reboot: </p>
                    <p class="num">{{rebootList.length}}</p>
                  </div>
                  <div class="item warning-wrap">
                    <p class="title">Warning: </p>
                    <p class="num">{{warningList.length}}</p>
                  </div>
                  <div class="item error-wrap">
                    <p class="title">Error: </p>
                    <p class="num">{{errorList.length}}</p>
                  </div>
                </div>
              </div>
              <span class="export" @click="showExportLog([filterLog])">导出</span>
            </div>
            <div class="body">
              <div class="content">
                <div class="item-log item-header">
                  <div class="item-log-time">时间</div>
                  <div class="item-log-level" :class="{'active': selectedType.length > 0}">类型<i @click.stop="isShowType = !isShowType" class="iconfont icon-left"></i>
                    <div v-show="isShowType" class="ul-wrap">
                      <ul>
                        <li @click.stop="selectLogLevel(label)" :class="{'active': selectedType.includes(label)}" :key="label" v-for="label in select_list">{{label}}</li>
                      </ul>
                    </div>
                  </div>
                  <div class="item-log-tag">标签</div>
                  <div class="item-log-data">日志</div>
                </div>
                <div class="item-log-wrap" :ref="filterLog['src_addr']">
                  <div class="item-log" :key="index" v-for="(item, index) in getFilterLogList(filterLog.list)">
                    <div class="item-log-time">{{item.data.times}}</div>
                    <div class="item-log-level"><span :class="getLogLevelClass(item)">{{item.data.level}}</span></div>
                    <div class="item-log-tag">{{item.tag || '--'}}</div>
                    <div class="item-log-data">{{item.data.data}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDeviceInfo, isEmpty, formatNumber, exportLog } from '@/assets/js/common'
import espGauge from '../components/gauge'
import {
  LOG_ERROR, LOG_ERROR_TEXT, LOG_INFO,
  LOG_INFO_TEXT,
  LOG_LEVEL,
  LOG_WARNING,
  LOG_WARNING_TEXT,
  DEEPSLEEP_RESET,
  POWERON_RESET,
  RESTART_FUNC,
  RTCWDT_BROWN_OUT_RESET,
  RTCWDT_RTC_RESET
} from '@/assets/js/constant'
let lineChart = ''
let timerId = ''
export default {
  name: 'index',
  components: {
    espGauge
  },
  data () {
    return {
      log_error: LOG_ERROR,
      log_info: LOG_INFO,
      log_warn: LOG_WARNING,
      log_level: LOG_LEVEL,
      barWidth: 10,
      deviceInfo: {},
      crashList: [],
      rebootList: [],
      errorList: [],
      warningList: [],
      select_list: [LOG_INFO_TEXT, LOG_WARNING_TEXT, LOG_ERROR_TEXT],
      selectedType: [],
      isShowType: false,
      lineData: {times: [], rssi: [], txRssi: []},
      memory: 0,
      colorList: ['#61CAD7', '#66a3fe']
    }
  },
  computed: {
    filterInfo () {
      const self = this
      self.deviceInfo = self.$store.state.deviceInfo
      self.initGauge()
      self.initLineData()
      return self.deviceInfo
    },
    filterLog () {
      const self = this
      let logList = self.$store.state.logList
      if (Object.keys(self.deviceInfo).length === 0) {
        return {}
      }
      let log = logList.find(item => item['src_addr'] === self.deviceInfo['src_addr']) || {}
      self.crashList = []
      self.rebootList = []
      self.errorList = []
      self.warningList = []
      self.getLevelList(log.list || [])
      return log
    }
  },
  beforeDestroy () {
    if (timerId) {
      clearTimeout(timerId)
    }
  },
  mounted () {
    const self = this
    this.$nextTick(() => {
      document.addEventListener('click', () => {
        self.isShowType = false
      })
      window.addEventListener('resize', () => {
        self.winWidth = window.innerWidth
      })
      self.getDeviceInfo()
    })
  },
  methods: {
    getDeviceInfo () {
      getDeviceInfo(this.deviceInfo['src_addr'])
      timerId = setTimeout(() => {
        this.getDeviceInfo()
      }, 2000)
    },
    showExportLog (list) {
      exportLog(list)
    },
    initGauge () {
      let memory = parseInt(this.deviceInfo?.free_heap || 0) / parseInt(this.deviceInfo?.total_heap || 100)
      this.memory = parseFloat((memory * 100).toFixed(2))
    },
    initLineData () {
      let rssi = this.deviceInfo?.rssi || 0
      rssi = parseInt(rssi)
      let txRssi = this.deviceInfo?.rx_rssi || 0
      txRssi = parseInt(txRssi)
      let date = new Date()
      if (this.lineData.times.length > 30) {
        this.lineData.times.shift()
      }
      this.lineData.times.push(`${date.getFullYear()}.${formatNumber(date.getMonth() + 1)}.${formatNumber(date.getDate())}\n${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}`)
      if (this.lineData.rssi.length > 30) {
        this.lineData.rssi.shift()
      }
      if (this.lineData.txRssi.length > 30) {
        this.lineData.txRssi.shift()
      }
      this.lineData.rssi.push(rssi)
      this.lineData.txRssi.push(txRssi)
      if (!lineChart) {
        this.$nextTick(() => {
          lineChart = this.initLine()
        })
      } else {
        lineChart.update()
      }
    },
    initLine () {
      let ctx = document.getElementById('device-info-line')
      ctx.height = 350
      ctx.width = this.$refs.canvasWrap.clientWidth
      // eslint-disable-next-line no-undef,no-new
      lineChart = new Chart(ctx, {
        type: 'line',
        // color: ['#ff0000', '#66a3fe', '#58d4e5', '#ff976a', '#ff5928'],
        data: {
          labels: this.lineData.times || [],
          datasets: [{
            label: 'TX Rssi',
            backgroundColor: this.colorList[0],
            borderColor: this.colorList[0],
            data: this.lineData.txRssi || []
          },
          {
            label: 'Rx Rssi',
            backgroundColor: this.colorList[1],
            borderColor: this.colorList[1],
            data: this.lineData.rssi || []
          }]
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          maintainAspectRatio: false,
          responsive: true,
          scaleShowLabels: false,
          scales: {
            xAxes: [{
              display: false,
              gridLines: {
                display: false,
                drawBorder: false
              }
            }],
            yAxes: [{
              display: false,
              gridLines: {
                drawBorder: false,
                color: '#f4f7fc'
              }
            }]
          }
        }
      })
      return lineChart
    },
    getNum (log) {
      return log?.list?.length || 0
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
        }
      })
    },
    getFilterLogList (list) {
      const self = this
      list = list.filter(log => {
        if (self.selectedType.includes(log?.data['level']) || self.selectedType.length === 0) {
          return log
        }
      })
      return list
    },
    selectLogLevel (label) {
      let index = this.selectedType.indexOf(label)
      if (index !== -1) {
        this.selectedType.splice(index, 1)
        return
      }
      this.selectedType.push(label)
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
    }
  }
}
</script>

<style lang="less" scoped>
.main-wrap {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  .device-info {
    margin-bottom: 20px;
    .info {
      background: @white-color;
      padding: 20px 15px;
      border-radius: 10px;
      box-shadow: 0 0 8px @white-color;
      .content {
        .flex;
        flex-wrap: wrap;
        width: 100%;
        max-width: 1300px;
        .item {
          width: 25%;
          padding: 6px 0;
          .flex;
          .flex-ac;
          label {
            font-weight: 500;
            flex: 0 0 80px;
            text-align: right;
            margin-right: 15px;
          }
        }
      }
    }
  }
  .main {
    .info {
      .flex;
      .item {
        flex: 1;
        background: @white-color;
        margin-right: 20px;
        border-radius: 10px;
        padding: 10px;
        box-shadow: 0 0 12px @white-color;
        &:last-child {
          margin-right: 0;
        }
        &.device-info-gauge {
          position: relative;
          max-width: 450px;
          .desc {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: @font-size-16;
            font-weight: 500;
          }
        }
      }
    }
  }
  .log {
    flex: 1;
    display: flex;;
    flex-direction: column;
    .header-log-level {
      .flex;
      .flex-ac;
      .item {
        .flex;
        .flex-ac;
        margin-left: 15px;
        padding: 4px 8px;
        color: @white-color;
        &.crash-wrap {
          background: @red-color;
        }
        &.reboot-wrap {
          background: @blue-color;
        }
        &.warning-wrap {
          background: @yellow-color;
        }
        &.error-wrap {
          background: @orange-color;
        }
        .title {
          font-size: @font-size !important;
          margin-right: 6px !important;
        }
        .num {
          font-size: @font-size;
          font-weight: bold;
        }
      }
    }
    .info {
      flex: 1;
      display: inherit;;
      flex-direction: inherit;
      margin: 0;
      .item-wrap {
        flex: 1;
        display: inherit;;
        flex-direction: inherit;
        padding: 0;
        box-sizing: border-box;
        .item {
          flex: 1;
          display: inherit;;
          flex-direction: inherit;
          .header {
            padding: 0 0 10px;
            justify-content: flex-start;
            align-items: center;
          }
          .body {
            flex: 1;
            max-height: 500px;
            .item-log-wrap {
              max-height: 473px;
            }
          }
        }
      }
    }
  }
}
</style>
