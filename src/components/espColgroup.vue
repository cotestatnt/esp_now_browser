<template>
  <colgroup>
    <col style="width: 50px" />
    <col style="width: 30px" />
    <col style="width: 130px" />
    <col style="width: 150px" />
    <col style="width: 130px" />
    <col style="width: 16%"/>
    <col style="width: 16%"/>
    <col style="width: 140px"/>
    <col v-if="isOperate" style="width: 100px" />
  </colgroup>
</template>

<script>
export default {
  name: 'espColgroup',
  props: {
    isOperate: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
    }
  },
  mounted () {
    this.$nextTick(() => {
    })
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
  .checkbox-wrap {
    position: relative;
    width: 20px;
    height: 20px;
    border: 1px solid @gray-light-color-2;
    border-radius: 4px;
    box-sizing: border-box;
    cursor: pointer;
    .esp-checked {
      position: absolute;
      width: 30%;
      height: 50%;
      left: 35%;
      top: 10%;
      border-right: 2px solid @white-color;
      border-bottom: 2px solid @white-color;
      border-radius: 1px;
      transform: rotate(45deg) scale(0);
      z-index: 2;
    }
    &.checked {
      background: @green-color;
      .esp-checked {
        transform: rotate(45deg) scale(1);
      }
    }

  }
</style>
