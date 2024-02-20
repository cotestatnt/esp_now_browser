<template>
  <div class="main-wrap">
    <div class="table">
      <h3 class="name flex flex-ac flex-jcs">
        <span>Device List</span>
        <div class="filter-wrap">
          <div class="search-item">
            <v-select @input="selectAppVersion" :options="appVersions" v-model="searchName"></v-select>
          </div>
        </div>
      </h3>
      <div class="info">
        <div class="btn-wrap">
          <button @click="getDeviceList" class="btn">Refresh</button>
          <button class="btn">Production measurement</button>
        </div>
        <esp-table ref="deviceListTable" @selection-change="selectDevice" :th-headers="thHeaders" :data="filterList">
          <template slot-scope="scope">
            <span @click="showInfo(scope.row)" class="btn-mini">control</span>
          </template>
        </esp-table>
      </div>
      <div class="production-test">
        <h3 class="name">Production measurement</h3>
        <div class="info">
          <div class="item-wrap">
            <h3>Hardware Version</h3>
            <div class="item-content">
              <div class="item">
                <label>Flash Version:</label>
                <div class="item-value">
                  <v-select :options="flashList" v-model="flash"></v-select>
                </div>
              </div>
              <div class="item">
                <label>Chip version:</label>
                <div class="item-value">
                  <v-select :options="chipList" v-model="chip"></v-select>
                </div>
              </div>
            </div>
          </div>
          <div class="item-wrap">
            <h3>Software version</h3>
            <div class="item-content">
              <div class="item">
                <label>Application version:</label>
                <div class="item-value">
                  <v-select :options="appList" v-model="app"></v-select>
                </div>
              </div>
              <div class="item">
                <label>Idf Version:</label>
                <div class="item-value">
                  <v-select :options="idfList" v-model="idf"></v-select>
                </div>
              </div>
            </div>
          </div>
          <div class="item-wrap">
            <h3>Wireless</h3>
            <div class="item-content">
              <div class="item">
                <label>RSSI strength:</label>
                <div class="item-value">
                  <vue-slider :min="-120" :max="0" :dotSize="dotSize" v-model="rssi"></vue-slider>
                </div>
              </div>
              <div class="item">
                <label>TX Power：</label>
                <div class="item-value">
                  <vue-slider :min="0" :max="25" :dotSize="dotSize" v-model="txPower"></vue-slider>
                </div>
              </div>
              <div class="item">
                <label>Delay:</label>
                <input type="text" class="form-control" />
              </div>
            </div>
          </div>
          <div class="item-wrap">
            <h3>Hardware performance</h3>
            <div class="item-content">
              <div class="item">
                <label>Temperature test:</label>
                <input type="text" class="form-control" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDeviceList, getAPPVersions } from '@/assets/js/common.js'
import { TH_HEADERS } from '../assets/js/constant'
export default {
  name: 'index',
  data () {
    return {
      searchName: '',
      thHeaders: TH_HEADERS,
      deviceList: [],
      selectMacs: [],
      isShowModal: false,
      appVersions: [],
      isShowSearch: false,
      flash: '',
      flashList: ['1', '2', '3'],
      chip: '',
      chipList: ['1', '2', '3'],
      app: '',
      appList: ['1', '2', '3'],
      idf: '',
      idfList: ['1', '2', '3'],
      rssi: -60,
      txPower: 0,
      dotSize: 20
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
    selectAppVersion (name) {
      console.log(name)
      this.searchName = name
    },
    showControl (item) {
    },
    getDeviceList () {
      getDeviceList()
    },
    selectDevice (macs) {
      console.log(macs)
      this.selectMacs = macs
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
  .production-test {
    margin-top: 20px;
    .info {
      padding-bottom: 20px;
    }
    .item-wrap {
      margin-bottom: 20px;
      .item-content {
        .flex;
        .flex-wrap;
        .item {
          flex: 0 0 30%;
          max-width: 400px;
          min-width: 200px;
          .flex;
          .flex-ac;
          .flex-wrap;
          margin-right: 20px;
          label {
            flex: 0 0 90px;
            margin: 6px 0;
          }
          .item-value {
            flex: 1;
            min-width: 200px;
          }
          .form-control {
            flex: 1;
          }
        }
      }
    }
  }
}
@media (max-width: 768px) {
  .main-wrap {
    .production-test {
      .item-wrap {
        .item-content {
          .item {
            flex: 0 0 100%;
            max-width: 100%;
            margin-right: 0;
            margin-bottom: 12px;
          }
        }
      }
    }
  }
}
</style>
