import notify from '@/components/notify'
let timerId
const install = Vue => {
  Object.defineProperty(Vue.prototype, '$notify', {
    get () {
      return ({type, message, duration}) => {
        const Constructor = Vue.extend(notify)
        let install = new Constructor({
          data () {
            return {
              message: message,
              type: type,
              show: true
            }
          }
        })
        if (!notify.el) {
          install.$mount()
          document.body.appendChild(install.$el)
        } else {
          install.$mount(notify.el)
        }
        notify.el = install.$el
        if (timerId) {
          clearTimeout(timerId)
        }
        timerId = setTimeout(() => {
          document.body.removeChild(notify.el)
          notify.el = null
        }, duration || 2000)
      }
    }
  })
}
export default install
