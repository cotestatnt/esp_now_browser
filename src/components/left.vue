<template>
  <div class="left-wrap">
    <div class="content">
      <div class="logo"><img src="../assets/imgages/logo-black.svg"></div>
      <ul>
        <li v-if="item.show" @click="jump(item.url)" :key="index" :class="{'active': curUrl === item.url}" v-for="(item, index) in urlList"><i class="iconfont" :class="item.icon"></i>{{item.label}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'left',
  data () {
    return {
      curUrl: '',
      winWidth: 1170,
      urlList: [
        {label: 'Debug', url: '/', icon: 'icon-debug', show: true},
        {label: 'Upgrade', url: '/ota', icon: 'icon-ota', show: true},
        {label: 'Control', url: '/control', icon: 'icon-control', show: true},
        {label: 'Network', url: '/wifi', icon: 'icon-config', show: true},
        {label: 'Production', url: '/test', icon: 'icon-test', show: true}
      ]
    }
  },
  mounted () {
    this.$nextTick(() => {
      console.log(this.$route.path)
      this.curUrl = this.$route.path
      this.winWidth = window.innerWidth
      this.resetMenu()
      window.addEventListener('resize', () => {
        this.winWidth = window.innerWidth
        this.resetMenu()
      })
    })
  },
  methods: {
    jump (url) {
      this.curUrl = url
      this.$router.push({
        path: url
      })
    },
    resetMenu () {
      if (this.winWidth > 900) {
        this.urlList = [
          {label: 'Debug', url: '/', icon: 'icon-debug', show: true},
          {label: 'Upgrade', url: '/ota', icon: 'icon-ota', show: true},
          {label: 'Control', url: '/control', icon: 'icon-control', show: true},
          {label: 'Network', url: '/wifi', icon: 'icon-config', show: true},
          {label: 'Production', url: '/test', icon: 'icon-test', show: true}
        ]
      } else {
        this.urlList = [
          {label: 'Debug', url: '/', icon: 'icon-debug'},
          {label: 'Upgrade', url: '/ota', icon: 'icon-ota'},
          {label: 'Control', url: '/control', icon: 'icon-control'},
          {label: 'Network', url: '/wifi', icon: 'icon-config'},
          {label: 'Production', url: '/test', icon: 'icon-test'}
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .left-wrap {
    flex: 0 0 160px;
    height: 100%;
    background: @white-color;
    border-right: 1px solid @light-blue-color;
    .content {
      height: inherit;
      box-sizing: border-box;
      .logo {
        padding: 20px 0;
        text-align: center;
        img {
          display: block;
          width: 120px;
          height: auto;
          margin: 0 auto;
        }
      }
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 40px 0 0;
      text-align: left;
      height: inherit;
      li {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 28px;
        padding: 0 24px 0 20px;
        box-sizing: border-box;
        cursor: pointer;
        color: @gray-color-1;
        .iconfont {
          font-size: 22px;
          margin-right: 12px;
          font-weight: bolder;
        }
        &:after {
          content: '';
          position: absolute;
          top: 50%;
          right: 0;
          height: 80%;
          transform: translateY(-50%);
          width: 4px;
          background: transparent;
          border-radius: 2px;
        }
        &.active {
          color: @green-color;
          .iconfont {
            color: @green-color;
          }
          &:after {
            background: @green-color;
          }
        }
      }
    }
  }

</style>
