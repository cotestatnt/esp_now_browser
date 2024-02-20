<template>
  <div class="main-wrap">
    <div class="table control-table-wrap">
      <h3 class="name flex flex-ac flex-jcs">
        <span>Device List</span>
        <div class="filter-wrap">
          <div class="search-item">
            <v-select @input="selectAppVersion"  :options="appVersions" v-model="searchName"></v-select>
          </div>
        </div>
      </h3>
      <div class="info">
        <div class="btn-wrap">
          <button @click="getDeviceList" class="btn">Refresh list</button>
          <button @click="showControl()" class="btn">Equipment control</button>
          <button @click="sendBind()" class="btn">Device binding</button>
        </div>
        <esp-table ref="deviceListTable" operate-text="state" @selection-change="selectDevice" :th-headers="thHeaders" :data="filterList">
          <template slot-scope="scope">
            <span :class="scope.row.rssi > -63 ? 'green' : 'red'">{{scope.row.rssi > -63 ? 'Bind' : 'Unbound'}}</span>
          </template>
        </esp-table>
      </div>
    </div>
    <div v-show="isShowControl" class="operate-modal-wrap operate-modal-mini-wrap">
      <div @click="isShowControl=false" class="mask"></div>
      <div class="content wifi-config-wrap">
        <span  @click="isShowControl=false" class="iconfont icon-error"></span>
        <div class="switch-wrap">
          <div @click="selectStatus()" class="switch" :class="{'active': status === 1}">
            <i class="iconfont icon-switch"></i>
          </div>
        </div>
        <div class="item-wrap">
          <div class="item">
            <label class="label">Number of retransmit (broadcasting):</label>
            <div class="input-wrap">
              <input v-model="retransmitCount" @input="changeRetransmitCount" min="0" class="form-control" type="number" >
            </div>
          </div>
          <div class="item">
            <label class="label">Forward the jump number:</label>
            <div class="input-wrap">
              <input v-model="forwardTtl" @input="changeForwardTtl"  min="0" class="form-control"  type="number" >
            </div>
          </div>
          <div class="item">
            <label class="label">Forward signal:</label>
            <div class="input-wrap">
              <input v-model="forwardRssi" @input="changeForwardRssi" max="0" class="form-control"  type="number" >
            </div>
          </div>
          <div class="item">
            <label class="label">ACK：</label>
            <div class="input-wrap  flex">
              <label @click="selectACK(1)" :class="{'checked': ack === 1}" class="radio-wrap">
                <span class="radio"></span>
                <span class="radio-text">true</span>
              </label>
              <label @click="selectACK(0)" :class="{'checked': ack === 0}"  class="radio-wrap">
                <span class="radio"></span>
                <span class="radio-text">false</span>
              </label>
            </div>
          </div>
          <div class="item">
            <label class="label">Filtering the weak signal:</label>
            <div class="input-wrap  flex">
              <label @click="selectFilterWeakSignal(1)"  :class="{'checked': filterWeakSignal === 1}" class="radio-wrap">
                <span class="radio"></span>
                <span class="radio-text">true</span>
              </label>
              <label @click="selectFilterWeakSignal(0)"  :class="{'checked': filterWeakSignal === 0}" class="radio-wrap">
                <span class="radio"></span>
                <span class="radio-text">false</span>
              </label>
            </div>
          </div>
          <div class="item">
            <label class="label">Filter the adjacent channel:</label>
            <div class="input-wrap  flex">
              <label @click="selectFilterAdjacentChannel(1)"  :class="{'checked': filterAdjacentChannel === 1}" class="radio-wrap">
                <span class="radio"></span>
                <span class="radio-text">true</span>
              </label>
              <label @click="selectFilterAdjacentChannel(0)"  :class="{'checked': filterAdjacentChannel === 0}" class="radio-wrap">
                <span class="radio"></span>
                <span class="radio-text">false</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDeviceList, getAPPVersions, hsv2rgb, sendBind, sendControl } from '@/assets/js/common.js'
import { TH_HEADERS } from '../assets/js/constant'
export default {
  name: 'index',
  data () {
    return {
      searchName: '',
      thHeaders: TH_HEADERS,
      deviceList: [],
      selectMacs: [],
      appVersions: [],
      isShowSearch: false,
      isShowControl: false,
      retransmitCount: 0,
      forwardTtl: 0,
      forwardRssi: 0,
      ack: 0,
      filterWeakSignal: 0,
      status: 0,
      filterAdjacentChannel: 0
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
    }
  },
  mounted () {
    const self = this
    this.$nextTick(() => {
      document.addEventListener('click', () => {
        self.isShowSearch = false
      })
    })
  },
  methods: {
    sendBind () {
      this.$loading.show()
      sendBind().then(res => {
        this.$loading.hide()
        this.$notify({ type: 'success', message: 'Send the binding command successfully' })
      }).catch(err => {
        this.$loading.hide()
        console.log(err)
        this.$notify({ type: 'error', message: 'Sending binding commands failed' })
      })
    },
    sendControl () {
      this.$loading.show()
      sendControl(this.retransmitCount, this.forwardTtl, this.forwardRssi, this.ack, this.filterWeakSignal, this.status, this.filterAdjacentChannel)
        .then(res => {
          this.$loading.hide()
          console.log(res)
          this.$notify({ type: 'success', message: 'Send the control command successfully' })
        }).catch(err => {
          console.log(err)
          this.$loading.hide()
          this.$notify({ type: 'error', message: 'Sending control command failed' })
        })
    },
    selectAppVersion (name) {
      this.searchName = name
    },
    changeRetransmitCount () {
      if (this.retransmitCount < 0) {
        this.retransmitCount = ''
      }
    },
    changeForwardTtl () {
      if (this.forwardTtl < 0) {
        this.forwardTtl = ''
      }
    },
    changeForwardRssi () {
      if (this.forwardRssi > 0) {
        this.forwardRssi = ''
      }
    },
    selectACK (val) {
      this.ack = val
    },
    selectBroadcast (val) {
      this.broadcast = val
    },
    selectFilterWeakSignal (val) {
      this.filterWeakSignal = val
    },
    selectFilterAdjacentChannel (val) {
      this.filterAdjacentChannel = val
    },
    selectStatus () {
      this.status = this.status === 1 ? 0 : 1
      this.sendControl()
    },
    changeValue (hue) {
      this.color.hue = parseInt(hue)
      console.log(this.color.hue)
      this.changeColor()
      let time = new Date().getTime()
      if (time - this.diffTime > 500) {
        this.diffTime = time
        this.controlDevice()
      }
    },
    handleValue (hue) {
      console.log()
      this.color.hue = parseInt(hue)
      this.changeColor()
    },
    changeColor () {
      this.rgb = `${hsv2rgb(this.color.hue / 360, this.saturation / 100, 1).join(',')}, ${this.brightness / 100}`
      console.log(this.rgb)
    },
    controlDevice () {
      console.log(this.color.hue, this.saturation, this.brightness)
    },
    showControl () {
      if (this.selectMacs.length === 0) {
        this.$notify({ type: 'warning', message: 'Please select the device' })
        return
      }
      this.isShowControl = true
    },
    getDeviceList () {
      getDeviceList()
    },
    selectDevice (macs) {
      this.selectMacs = macs
    }
  }
}
</script>

<style lang="less" scoped>
.main-wrap {
  width: 100%;
  min-height: 100%;
  .control-modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 25px;
    width: 90%;
    height: 90%;
    max-width: 450px;
    max-height: 600px;
    background: @white-color;
    border-radius: @border-radius-10;
    box-sizing: border-box;
    box-shadow: 0 0 10px @white-color;
    .operate-item {
      position: relative;
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0;
      }
      .label {
        font-weight: 500;
      }
    }
    .switch-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      height: 90px;
      width: 90px;
      .flex;
      .flex-ac;
      .flex-jcc;
      border-radius: 50%;
      .iconfont {
        font-size: 44px;
        color: @light-blue-color-1;
        text-shadow: 0 0 6px @light-blue-color-3;
        border-radius: 50%;
      }
      &.active {
        .iconfont {
          color: @white-color;
        }
      }
      &.hideShadow {
        background: @light-gray-color !important;
        box-shadow: none !important;
        .iconfont {
          color: @white-color !important;
        }
      }
    }
  }
  .operate-modal-wrap {
    .item {
      justify-content: start !important;
      .label {
        flex: 0 0 105px;
        text-align: right;
      }
      .input-wrap {
        flex: 1;
        .form-control {
          width: 100%;
        }
      }
      .radio-wrap {
        .flex;
        .flex-ac;
        position: relative;
        white-space: nowrap;
        margin-right: 12px;
        min-width: 60px;
        cursor: pointer;
        .radio {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 8px;
          position: relative;
          top: 0;
          left: 0;
          background-color: #fff;
          border: 1px solid #d7dde4;
          border-radius: 50%;
          transition: all .2s ease-in-out;
          &:after {
            position: absolute;
            width: 12px;
            height: 12px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0);
            border-radius: 6px;
            display: table;
            border-top: 0;
            border-left: 0;
            content: ' ';
            background-color: @green-color;
            opacity: 0;
            transition: all .2s ease-in-out;
          }
        }
        &.checked {
          .radio {
            border-color: @green-color;
            &:after {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
              transition: all .2s ease-in-out;
            }
          }
        }
        .radio-text {
          font-weight: 500;
        }
      }
      .switch-wrap {
        display: inline-block;
        width: 48px;
        height: 24px;
        line-height: 22px;
        border-radius: 24px;
        vertical-align: middle;
        border: 1px solid #ccc;
        background-color: #ccc;
        position: relative;
        cursor: pointer;
        user-select: none;
        transition: all .2s ease-in-out;
        box-sizing: border-box;
        &:after {
          content: '';
          width: 20px;
          height: 20px;
          border-radius: 20px;
          background-color: #fff;
          position: absolute;
          left: 1px;
          top: 1px;
          cursor: pointer;
          transition: left .2s ease-in-out,width .2s ease-in-out;
        }
        &.checked {
          border-color: @green-color;
          background-color: @green-color;
          &:after {
            left: 25px;
          }
        }
      }
    }
  }
}

</style>
