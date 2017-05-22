'use strict'

var integration = require('@segment/analytics.js-integration')
var useHttps = require('use-https')
var reject = require('reject')
/**
 * Expose `Wigzo` integration
 */

var Wigzo = module.exports = integration('Wigzo')
  .global('wigzo')
  .option('orgToken', '')
  .tag('<script src="https://tracker.wigzopush.com/wigzo.js">')
  .tag('https_manifest', '<link rel="manifest" href="/gcm_manifest.json">')
  .tag('https_tracker', '<script src="https://tracker.wigzopush.com/wigzopush_manager.js?orgtoken={{ orgToken }}">')
  .tag('http_tracker', '<script src="https://tracker.wigzopush.com/gcm_http_subscribe.js?orgtoken={{ orgToken }}">')

/**
 * Initialize Wigzo
 */

Wigzo.prototype.initialize = function () {
  
  window.wigzo.init(this.options.orgToken)
  if (!useHttps()) {
    window.wigzo.httpGcmShowDialog = true
    this.load('https_manifest', this.ready)
    this.load('https_tracker', this.ready)
  } else {
    window.wigzo.wigzoGcmAutoSubscribe = true
    this.load('http_tracker', this.ready)
  }
}

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Wigzo.prototype.loaded = function () {
  return !!window.wigzo
}

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Wigzo.prototype.identify = function (identify) {
  var id = identify.userId()
  if (id) window.wigzo.USERID = id

  window.wigzo.COOKIEID = identify.anonymousId()
  var traits = reject({
    email: identify.email(),
    phone: identify.phone(),
    fullName: identify.name()
  })
  window.wigzo.identify(traits)
}

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Wigzo.prototype.track = function (track) {
  window.wigzo.track(track.event(), track.properties())
}

/**
 * Page.
 *
 * @param {Page} page
 */

Wigzo.prototype.page = function (page) {
  window.wigzo.index(page.properties())
}
