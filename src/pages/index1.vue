<template>
  <div class="wrap">
    <div class="main-wrap">
      <div class="resv-wrap">
        <div class="item" :class="{'error': !item.status}" :key="item.time" v-for="item in  list">
          <p class="time">{{item.time}}~</p>
          <p class="data">{{item.data}}</p>
        </div>
      </div>
      <div class="send-wrap">
<!--        <textarea @keydown.enter.exact='sendData' @keydown.ctrl.enter="addNewLine"-->
<!--                  @keydown.meta.enter="addNewLine" v-model="value" class="form-control-textarea"></textarea>-->
        <textarea @keyup.up="prevValue" @keyup.down="nextValue" @keydown.enter.exact='sendData'  v-model="value" class="form-control-textarea"></textarea>
        <div class="send-btn-wrap">
          <button @click="sendData" class="btn">Send</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { httpGet, httpPost, getDate, isEmpty } from '@/assets/js/common.js'
import { SEND_URL, RESV_URL, HOSTORY_COMMAND } from '@/assets/js/constant.js'
export default {
  name: 'index',
  data () {
    return {
      list: [],
      value: '',
      hostoryList: []
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.getCommand()
      this.getData()
    })
  },
  methods: {
    getData () {
      const self = this
      httpGet(this, RESV_URL).then(res => {
        self.list.push({time: getDate(), data: res, status: res?.errno === 0})
        setTimeout(() => {
          this.getData()
        }, 500)
      }).catch(e => {
        console.log(e)
      })
    },
    sendData (e) {
      const self = this
      if (window.event) {
        window.event.returnValue = false
      } else {
        e.preventDefault()
      }
      console.log(this.value)
      httpPost(this, SEND_URL, self.value).then(res => {
        self.getCommand()
        self.hostoryList.push(self.value)
        localStorage.setItem(HOSTORY_COMMAND, JSON.stringify(self.hostoryList))
        self.list.push({time: getDate(), data: res, status: true})
      }).catch(e => {
        console.log(e)
      })
    },
    getCommand () {
      let command = localStorage.getItem(HOSTORY_COMMAND)
      if (!isEmpty(command)) {
        this.hostoryList = JSON.parse(command)
        return
      }
      this.hostoryList = []
    },
    prevValue () {
      if (this.hostoryList.length > 0) {
        let index = this.hostoryList.indexOf(this.value)
        if (index > 0) {
          this.value = this.hostoryList[index - 1]
        }
      }
    },
    nextValue () {
      if (this.hostoryList.length > 0) {
        let index = this.hostoryList.indexOf(this.value)
        if (index < (this.hostoryList.length - 1)) {
          this.value = this.hostoryList[index + 1]
        }
      }
    },
    addNewLine (e) {
      // 1.Get the cursor position
      const ele = e.target
      const cursorIndex = ele.selectionStart

      // 2.Add the change in the cursor after the cursor
      let tempValue = this.value.split('')
      tempValue.splice(cursorIndex, 0, '\n')
      this.value = tempValue.join('')

      // 3.Mobile cursor
      ele.selectionStart = ele.selectionEnd = cursorIndex + 1
    }
  }
}
</script>

<style lang="less" scoped>
.wrap {
  height: 100vh;
  width: 100%;
  background: @gray-light-color-3;
  .main-wrap {
    display: flex;
    flex-direction: column;
    height: inherit;
    width: 100%;
    max-width: 1140px;
    padding: 15px;
    box-sizing: border-box;
    margin: 0 auto;
    .resv-wrap {
      flex: 1;
      border: 1px solid @gray-light-color-2;
      background: @white-color;
      box-shadow: inset 0 0 10px @gray-light-color-3;
      .border-radius-10;
      overflow: hidden;
      overflow-y: auto;
      padding: 15px;
      box-sizing: border-box;
      .item {
        display: flex;
        align-items: flex-start;
        &.error {
          color: red;
        }
        p {
          margin: 0 0 8px;
          text-align: left;
        }
        .time {
          white-space:nowrap;
          margin-right: 15px;
        }
      }
    }
    .send-wrap {
      margin-top: 15px;
      flex: 0 0 20%;
      min-height: 120px;
      .border-radius-10;
      display: flex;
      flex-direction: column;
      .send-btn-wrap {
        text-align: right;
      }
      .btn {
        margin-top: 15px;
        width: 120px;
        background: @blue-color;
        line-height: 36px;
        border: none;
        color: @white-color;
        box-shadow: 0 0 3px @blue-color;
        .border-radius-10;
        cursor: pointer;
        &:hover {
          opacity: .8;
        }
      }
    }
  }
  .form-control-textarea {
    flex: 1;
    padding: 10px;
    border: none;
    background: @white-color;
    outline: none;
    box-shadow: inset 0 0 10px @gray-light-color-3;
    box-sizing: border-box;
    .border-radius-10;
    resize: none;
  }

}

</style>
