<template>
  <div id="app">
    <esp-left></esp-left>
    <div class="main-content">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="less">
#app {
  font: @font-size 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: @black-color;
  display: flex;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
  .main-content {
    flex: 1;
    padding: 20px;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>
