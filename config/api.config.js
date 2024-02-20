// 判断是否是生产环境
var isPro = process.env.NODE_ENV === 'production'
// 根据环境不同导出不同的 baseURL
module.exports = {
  baseURL: isPro ? 'http://espnow-webserver/' : '/api'
}
