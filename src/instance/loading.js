import Vue from 'vue'
import loading from '@/components/loading'
const Constructor = Vue.extend(loading)
let constructorDom
const Message = ({show}) => {
  if (show) {
    constructorDom = new Constructor({
      data () {
        return {
          show: true
        }
      }
    }).$mount()
    constructorDom.el = constructorDom.$el
    document.body.appendChild(constructorDom.$el)
    return
  }
  if (constructorDom?.el) {
    document.body.removeChild(constructorDom.el)
    constructorDom.el = ''
  }
}
Message['show'] = (title, location) => {
  Message({show: true})
}
Message['hide'] = () => {
  Message({show: false})
}
const install = (Vue, options = {}) => {
  Vue.prototype.$loading = Message
}
export default install
