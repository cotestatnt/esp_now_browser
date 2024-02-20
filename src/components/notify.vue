<template>
  <transition name="up">
    <div v-if="show" ref="notify" class="esp-notify" :class="type" >
      <p>{{message}}</p>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'notify',
  methods: {
    close () {
      this.show = false
    }
  }
}
</script>

<style lang="less" scoped>
.esp-notify {
  position: fixed;
  top: 0;
  left: 50%;
  width: 100%;
  max-width: 300px;
  transform: translate(-50%);
  padding: 8px;
  text-align: center;
  color: @white-color;
  font-size: @font-size;
  z-index: 100;
  border-radius: 10px;
  &.warning {
    background: @yellow-color;
  }
  &.error {
    background: @orange-color;
  }
  &.success {
    background: @green-color;
  }
  p {
    margin: 0;
  }
}
</style>
