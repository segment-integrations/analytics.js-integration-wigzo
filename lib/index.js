'use strict'

var integration = require('@segment/analytics.js-integration');
var useHttps = require('use-https');
/**
 * Expose `Wigzo` integration
 */

var Wigzo = module.exports = integration('Wigzo')
  .readyOnInitialize()
  .global('wigzo')
  .option('orgToken', '')
  .option('features', [])
  .tag('<script src="https://tracker.wigzopush.com/wigzo.js">')
  .tag('https', '<link rel="manifest" href="/gcm_manifest.json">') /* This needs to be put inside <head>.Is this correct syntax ? */
  .tag('https', '<script src="https://tracker.wigzopush.com/wigzopush_manager.js?orgtoken={{ orgToken }}">')
  .tag('http', '<script src="https://tracker.wigzopush.com/gcm_http_subscribe.js?orgtoken={{ orgToken }}">');

/**
 * Initialize Wigzo
 */

Wigzo.prototype.initialize = function (){

  window.wigzo.setIntegrationSource('Segment');

  window.wigzo.init(settings.orgToken, settings.features);
  var name = 'https';
  if(!useHttps()){
    name = 'http';
    window.wigzo.httpGcmShowDialog = true;
  } else {
    window.wigzo.wigzoGcmAutoSubscribe = true;
  }
  
  this.load(name, this.ready);
};


/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Wigzo.prototype.loaded = function() {
  return !!window.wigzo;
};



/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Wigzo.prototype.identify = function(identify) {
  var traits = identify.traits();
  var id = identify.userId();
  if (id) window.wigzo.USERID = id;

  window.wigzo.COOKIEID = identify.anonymousId;
  if (traits) {
    window.wigzo.identify({
      email : traits.email ? traits.email : '',
      phone : traits.phone ? traits.phone : '',
      fullName : traits.name ? traits.name : ''
    })
  }
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Wigzo.prototype.track = function(track) {
  var event = track.event();
  var properties = track.properties();
  window.wigzo.track(event, properties);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Wigzo.prototype.page = function(page) {
  var properties = page.properties();
  window.wigzo.index( properties);
};

