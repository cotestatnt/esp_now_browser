<template>
  <div class="main-wrap">
    <div class="table">
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
          <button @click="getDeviceList" class="btn">Refresh</button>
          <button @click="showControl()" class="btn">Network</button>
        </div>
        <esp-table ref="deviceListTable" @selection-change="selectDevice" :th-headers="thHeaders" :data="filterList">
          <template slot-scope="scope">
            <span @click="showInfo(scope.row)" class="btn-mini">Distribution net</span>
          </template>
        </esp-table>
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
      appVersions: [],
      isShowSearch: false
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
}

</style>
