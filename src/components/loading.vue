<template>
  <div class="loading-wrap">
    <div class="loading-spinner">
      <span class="loading__spinner loading__spinner--circular"><svg viewBox="25 25 50 50" class="van-loading__circular"><circle cx="50" cy="50" r="20" style="stroke-width: 1.4" fill="none"></circle></svg></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'espLoading',
  methods: {
  }
}
</script>

<style lang="less" scoped>
.loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 12;
  &:after {
    position: absolute;
    top: 0;
    left: 0;
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,.1);
  }
  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    z-index: 15;
    color: @green-color;
  }
  .loading__spinner {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    animation: rotate 1.5s linear infinite;
  }
  .van-loading__spinner--circular {
    animation-duration: 2s;
  }
  .van-loading__circular circle {
    animation: circular 2s ease-in-out infinite;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
  }
  @keyframes circular {
    0%{stroke-dasharray:1,200;stroke-dashoffset:0}
    50%{stroke-dasharray:90,150;stroke-dashoffset:-40}
    100%{stroke-dasharray:90,150;stroke-dashoffset:-120}
  }
  @keyframes rotate{
    from{-webkit-transform:rotate(0);transform:rotate(0)}
    to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}
  }
}
</style>
