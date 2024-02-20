<template>
  <div class="table-wrap">
    <div class="table-content" :class="{'active': data.length === 0}">
      <div class="table-thead">
        <table cellpadding="0" cellspacing="0">
          <esp-colgroup :is-operate="isOperate"></esp-colgroup>
          <thead>
          <tr class="">
            <template v-for="(item, index) in thHeaders">
              <th v-if="item.isCheckBox && index === 0" :key="index" @click="selectAll(item.props)" class="checkbox-width"><esp-checkbox :checked="selectMacs.length >= data.length && selectMacs.length !== 0"></esp-checkbox></th>
              <th v-else-if="item.isShowNo && index === 1"  :key="index">#</th>
              <th v-else :key="index" :class="{'sort-wrap': item.isSort}">
                <div class="cell">
                  {{item.label}}
                  <span v-if="item.isSort" class="caret-wrapper">
                <span class="flex flex-v">
                  <i @click="ascFun(item.props)" :class="{'active': sortVal === item.props && isAsc}" class="iconfont icon-up"></i>
                  <i @click="descFun(item.props)" :class="{'active': sortVal === item.props && !isAsc}" class="iconfont icon-down"></i>
                </span>
              </span>
                </div>
              </th>
            </template>
            <th v-if="isOperate">{{operateText}}</th>
          </tr>
          </thead>
        </table>
      </div>
      <div class="table-body">
        <table cellpadding="0" cellspacing="0">
          <esp-colgroup :is-operate="isOperate"></esp-colgroup>
          <tbody>
          <tr :key="index" v-for="(item, index) in filterList">
            <template v-for="(th, i) in thHeaders">
              <td v-if="th.isCheckBox && i === 0" :key="i" @click="selectDevice(item[th.props])" class="checkbox-width"><esp-checkbox :checked="selectMacs.includes(item[th.props])"></esp-checkbox></td>
              <td v-else-if="th.isShowNo && i === 1" :key="i">{{index + 1}}</td>
              <td v-else :key="i">{{item[th.props]}}</td>
            </template>
            <td v-if="isOperate"><slot :row="item"></slot></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p v-if="data.length === 0" class="no-data textCenter">No data</p>
  </div>
</template>

<script>
import { isEmpty } from '@/assets/js/common.js'
export default {
  name: 'espTable',
  props: {
    thHeaders: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    isOperate: {
      type: Boolean,
      default: true
    },
    operateText: {
      type: String,
      default: 'Operate'
    }
  },
  data () {
    return {
      selectMacs: [],
      deviceList: [],
      sortVal: '',
      isAsc: false
    }
  },
  computed: {
    filterList () {
      const self = this
      let list = JSON.parse(JSON.stringify(self.data))
      if (!isEmpty(self.sortVal)) {
        console.log('ssss')
        list = list.sort((a, b) => {
          if (self.isAsc) {
            return a[self.sortVal] > b[self.sortVal] ? 1 : -1
          } else {
            return b[self.sortVal] > a[self.sortVal] ? 1 : -1
          }
        })
      }
      self.deviceList = list
      return self.deviceList
    }
  },
  mounted () {
    this.$nextTick(() => {
    })
  },
  methods: {
    selectAll (id) {
      if (this.selectMacs.length === this.deviceList.length) {
        this.selectMacs = []
        return
      }
      this.selectMacs = this.deviceList.map(item => {
        return item[id]
      })
      this.$emit('selection-change', this.selectMacs)
    },
    setSelected (macs) {
      this.selectMacs = macs
    },
    selectDevice (mac) {
      if (mac) {
        let index = this.selectMacs.indexOf(mac)
        if (index !== -1) {
          this.selectMacs.splice(index, 1)
          return
        }
        this.selectMacs.push(mac)
        this.$emit('selection-change', this.selectMacs)
      }
    },
    ascFun (filed) {
      if (this.sortVal === filed && this.isAsc) {
        this.sortVal = ''
        return
      }
      this.sortVal = filed
      this.isAsc = true
    },
    descFun (filed) {
      if (this.sortVal === filed && !this.isAsc) {
        this.sortVal = ''
        return
      }
      this.sortVal = filed
      this.isAsc = false
    }
  }
}
</script>

<style lang="less" scoped>
.table-wrap {
  margin-top: 20px;
  position: relative;
  max-height: 400px;
  overflow: auto;
  .table-content {
    &.active {
      padding-bottom: 50px;
    }
  }
  .table-thead {
    position: sticky;
    top: 0;
    width: 100%;
    border-top: 1px solid @gray-light-color-3;
    background: @white-color;
    z-index: 11;
    min-width: 960px;
  }
  .table-body {
    width: 100%;
    min-width: 960px;
  }
  table {
    width: 100%;
    text-align: left;
    thead {
      th {
        font-weight: normal;
        font-size: @font-size;
        padding: 16px 15px;
        text-align: center;
        border-bottom: 1px solid @gray-light-color-3;
        box-sizing: border-box;
      }
    }
    tbody {
      td {
        padding: 16px 15px;
        text-align: center;
        border-bottom: 1px solid @gray-light-color-3;
        box-sizing: border-box;
        word-break: break-all;
      }
      tr:last-child {
        td {
          border-bottom: none;
        }
      }
    }
    .checkbox-width {
      width: 50px;
      box-sizing: border-box;
    }
  }
  .sort-wrap {
    vertical-align: middle;
    .cell {
      display: inline-block;
      box-sizing: border-box;
      position: relative;
      vertical-align: middle;
      width: 100%;
    }
    .caret-wrapper {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      margin-top: -2px;
      width: 20px;
      vertical-align: middle;
      cursor: pointer;
      overflow: initial;
      position: relative;
      .iconfont {
        font-size: @font-size-mini;
        color: @gray-color;
        transform: scale(.7);
        cursor: pointer;
        &.icon-down {
          margin-top: -5px;
        }
        &.active {
          color: @green-color;
        }
      }
    }
  }
  .btn-mini {
    color: @green-color;
    cursor: pointer;
  }
  .no-data {
    position: absolute;
    width: 100%;
    left: 0;
    top: 60px;
  }
}

</style>
