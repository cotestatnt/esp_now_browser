// Determine whether it is a production environment
var isPro = process.env.NODE_ENV === 'production'
// Different exports depending on the environment baseURL
module.exports = {
  baseURL: isPro ? 'http://espnow-webserver/' : '/api'
}
