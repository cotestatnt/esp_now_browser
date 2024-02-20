<template>
  <div class="main-wrap">
    <div class="table">
      <h3 class="name flex flex-ac flex-jcs">
        <span>设备列表</span>
        <div class="filter-wrap">
          <div class="search-item">
            <v-select :options="appVersions" v-model="searchName"></v-select>
          </div>
        </div>
      </h3>
      <div class="info">
        <div class="btn-wrap">
          <button @click="getDeviceList" class="btn">刷新列表</button>
          <button @click="showModal(COMMAND_OTA)" class="btn">版本升级</button>
          <button @click="showModal(COMMAND_BACK)" class="btn">版本回退</button>
        </div>
        <esp-table ref="deviceListTable" @selection-change="selectDevice" :th-headers="thHeaders" :data="filterList">
          <template slot-scope="scope">
            <span @click="showInfo(scope.row)" class="btn-mini">详情</span>
          </template>
        </esp-table>
      </div>
    </div>
    <div v-show="isShowModal" class="operate-modal-wrap operate-modal-mini-wrap">
      <div @click="isShowModal=false" class="mask"></div>
      <div class="content">
        <h3>{{title}}</h3>
        <div  v-if="operateType === COMMAND_OTA"  class="filter-wrap">
          <div class="bin-wrap">
            <div class="bin-content">
              <label for="bin-file">BIN 文件：</label>
              <div class="file-wrap">
                <input id="bin-file" @change="getFile" accept=".bin" type="file" ref="file"/>
                <div class="file-btn">选取文件</div>
              </div>
            </div>
            <div class="file-name">{{fileName}}</div>
          </div>
        </div>
        <p v-else>确定要对选中的设备进行版本回退吗？</p>
        <div class="btn-wrap">
          <button @click="isShowModal=false" class="btn btn-danger">取消</button>
          <button @click="operateEvent" class="btn">确定</button>
        </div>
      </div>
    </div>
    <div v-show="isShowLog" class="operate-modal-log-wrap">
      <div @click="isShowLog=false" class="mask"></div>
      <div class="close-wrap"><i @click="isShowLog=false" class="iconfont icon-error"></i></div>
      <div class="log">
        <div class="info flex flex-wrap">
          <div class="item-wrap flex-1" :key="item['src_addr']" v-for="item in filterLogs">
            <div class="item">
              <div class="header">
                <p><span class="title">{{item['src_addr']}}</span><span class="num">({{item.list.length}}条日志)</span></p>
              </div>
              <div class="body">
                <div class="content">
                  <div class="item-log item-header">
                    <div class="item-log-time">时间</div>
                    <div class="item-log-level">类型</div>
                    <div class="item-log-tag">标签</div>
                    <div class="item-log-data">日志</div>
                  </div>
                  <div class="item-log-wrap" :ref="item['src_addr']">
                    <div class="item-log" :key="index" v-for="(item, index) in item.list">
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
    </div>
  </div>
</template>

<script>
import { getDeviceList, otaBackDevice, getAPPVersions } from '@/assets/js/common.js'
import {
  COMMAND_OTA, COMMAND_BACK, FILE_BIN_TYPE, TH_HEADERS, LOG_INFO, LOG_WARNING, LOG_ERROR,
  LOG_OTA_LIST
} from '../assets/js/constant'
export default {
  name: 'index',
  data () {
    return {
      COMMAND_OTA: COMMAND_OTA,
      COMMAND_BACK: COMMAND_BACK,
      searchName: '',
      title: '选择 Bin 文件',
      thHeaders: TH_HEADERS,
      deviceList: [],
      selectMacs: [],
      isShowModal: false,
      fileName: '',
      appVersions: [],
      isShowSearch: false,
      operateType: '',
      isShowLog: false,
      logOtaList: LOG_OTA_LIST
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
      if (self.isShowLog) {
        self.logList = self.$store.state.logList
        self.logList.forEach((item, index) => {
          let list = item?.list || []
          list = list.filter(log => this.logOtaList.includes(log.tag))
          self.logList[index].list = list
        })
        self.setScroll()
        return self.logList
      }
      return []
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
    showModal (type) {
      if (this.selectMacs.length === 0) {
        this.$notify({ type: 'warning', message: '请选择设备' })
        return
      }
      this.operateType = type
      this.isShowModal = true
      if (this.operateType === COMMAND_OTA) {
        this.title = '选择 Bin 文件'
        return
      }
      if (this.operateType === COMMAND_BACK) {
        this.title = '版本回退'
      }
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
    selectAppVersion (name) {
      this.searchName = name
    },
    operateEvent () {
      const self = this
      if (self.operateType === COMMAND_OTA) {
        let file = this.$refs.file.files[0]
        if (file?.type !== FILE_BIN_TYPE) {
          this.$refs.file.value = ''
          this.$notify({ type: 'warning', message: '请选择 Bin 文件' })
          return
        }
      }
      if (self.operateType === COMMAND_OTA) {
        self.isShowLog = true
        self.startOta(self.selectMacs)
        return
      }
      if (self.operateType === COMMAND_BACK) {
        otaBackDevice(self.selectMacs)
      }
    },
    getFile () {
      try {
        let file = this.$refs.file.files[0]
        if (file.type !== FILE_BIN_TYPE) {
          this.$refs.file.value = ''
          this.$notify({ type: 'warning', message: '请选择 Bin 文件' })
          return
        }
        this.fileName = `${file.name}  ${(file.size / (1024 * 1024)).toFixed(2)} M`
      } catch (e) {
      }
    },
    startOta (macs) {
      let file = this.$refs.file.files[0]
      if (file?.type !== FILE_BIN_TYPE) {
        this.$refs.file.value = ''
        this.$notify({ type: 'warning', message: '请选择 Bin 文件' })
        return
      }
      this.isShowModal = false
      window.$axios({
        url: 'ota/data',
        method: 'post',
        data: file,
        headers: {
          'Content-Type': 'application/octet-stream;charset=UTF-8',
          'Device-List': macs.join(',')
        }
      }).then(res => {
        console.log(res)
      }).catch(e => {
        console.log(e)
      })
    },
    showInfo (item) {
      if (item) {
        this.$store.commit('setDeviceInfo', item)
        this.$router.push({
          path: '/deviceInfo'
        })
      }
    },
    getDeviceList () {
      getDeviceList()
    },
    selectDevice (macs) {
      console.log(macs)
      this.selectMacs = macs
    },
    selectOperateDevice (macs) {
      console.log(macs)
      this.operateMacs = macs
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
    }
  }
}
</script>

<style lang="less" scoped>
.main-wrap {
  width: 100%;
  min-height: 100%;
  .table-wrap {
    max-height: calc(100vh - 180px);
  }
  .filter-wrap {
    .flex;
    .flex-ac;
    position: relative;
    .bin-wrap {
      width: 100%;
      .flex;
      .flex-ac;
      .flex-v;
      margin: 15px 0;
      .bin-content {
        .flex;
        .flex-ac;
      }
    }
    .search-item {
      position: relative;
      input {
        padding: 0 25px;
        box-sizing: border-box;
        min-width: 260px;
      }
      .icon-search {
        color: @gray-color;
        position: absolute;
        left: 6px;
        top: 50%;
        transform: translateY(-50%);
      }
      .icon-left {
        color: @gray-color;
        position: absolute;
        right: 6px;
        top: 50%;
        font-size: @font-size;
        transform: translateY(-50%);
        cursor: pointer;
        transition: all .2s linear;
        &.active {
          transform: translateY(-50%) rotate(180deg);
        }
      }
    }
  }
}

</style>
