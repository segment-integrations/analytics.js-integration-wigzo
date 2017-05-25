'use strict';

var integration = require('@segment/analytics.js-integration');
var reject = require('reject');
/**
 * Expose `Wigzo` integration
 */

var Wigzo = module.exports = integration('Wigzo')
  .global('wigzo')
  .option('orgToken', '')
  .tag('tracker', '<script src="https://tracker.wigzopush.com/wigzo.js">')
  .tag('http_tracker', '<script src="https://tracker.wigzopush.com/gcm_http_subscribe.js?orgtoken={{ orgToken }}">');

/**
 * Initialize Wigzo
 */

Wigzo.prototype.initialize = function() {
  var orgToken = this.options.orgToken;
  /* eslint-disable */
  window.wigzo=function(a){return a.USER_IDENTIFIER="",a.ORGANIZATIONID=orgToken,a.FEATURES={ONSITEPUSH:!0},a}(window.wigzo||{});
  /* eslint-enable */

  window.wigzo.integrationSource = 'Segment';
  window.wigzo.httpGcmShowDialog = true;
  this.load('tracker', this.ready);
  this.load('http_tracker', this.ready);
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
 * Product Added
 *
 * @param {Track} track
 */

Wigzo.prototype.productAdded = function(track) {
  var productId = track.productId();
  if (productId) window.wigzo.track('addtocart', productId);
};


/**
 * Wishlist Product Added to Cart
 *
 * @param {Track} track
 */

Wigzo.prototype.productAddedFromWishlistToCart = function(track) {
  var productId = track.productId();
  if (productId) window.wigzo.track('addtocart', productId);
};

/**
 * Product Removed
 *
 * @param {Track} track
 */

Wigzo.prototype.productRemoved = function(track) {
  var productId = track.productId();
  if (productId) window.wigzo.track('removedfromcart', productId);
};

/**
 * Products Searched
 *
 * @param {Track} track
 */

Wigzo.prototype.productsSearched = function(track) {
  var props = track.properties();
  if (props.query) {
    window.wigzo.track('search', props.query);
  }
};

/**
 * Product Added to Wishlist
 *
 * @param {Track} track
 */

Wigzo.prototype.productAddedToWishlist = function(track) {
  var productId = track.productId();
  if (productId) window.wigzo.track('wishlist', productId);
};


/**
 * Checkout Started
 *
 * @param {Track} track
 */

Wigzo.prototype.checkoutStarted = function(track) {
  var productList = track.products();
  var addedProductIds = [];
  for (var i = 0; i < productList.length; i++) {
    var item = productList[i];
    addedProductIds.push(item.product_id || item.productId);
  }

  if (addedProductIds.length) window.wigzo.track('checkoutstarted', addedProductIds);
};

/**
 * Completed Order
 *
 * @param {Track} track
 */

Wigzo.prototype.orderCompleted = function(track) {
  var productList = track.products();
  var addedProductIds = [];
  for (var i = 0; i < productList.length; i++) {
    var item = productList[i];
    addedProductIds.push(item.product_id || item.productId);
  }

  if (addedProductIds.length) window.wigzo.track('buy', addedProductIds);
};

/**
 * Product Review
 *
 * @param {Track} track
 */
Wigzo.prototype.productReviewed = function(track) {
  window.wigzo.track('review', track.properties());
};

/**
 * Product Clicked
 *
 * @param {Track} track
 */
Wigzo.prototype.productClicked = function(track) {
  var props = track.properties();
  var traits = reject({
    productId : track.productId(),
    title: track.name(),
    price: track.currency() + ' ' + track.price(),
    category: track.category(),
    /* custom props */
    image: props.imageUrl,
    canonicalUrl: props.canonicalUrl,
    description: props.description,
    language:props.language
  });
  window.wigzo.index(traits);
};

/**
 * Product Viewed
 *
 * @param {Track} track
 */
Wigzo.prototype.productViewed = function(track) {
  var props = track.properties();
  var traits = reject({
    productId : track.productId(),
    title: track.name(),
    price: track.currency() + ' ' + track.price(),
    category: track.category(),
    /* custom props */
    image: props.imageUrl,
    canonicalUrl: props.canonicalUrl,
    description: props.description,
    language:props.language
  });
  window.wigzo.index(traits);
  window.wigzo.track('view', traits);
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Wigzo.prototype.identify = function(identify) {
  var id = identify.userId();
  if (id) window.wigzo.USER_IDENTIFIER = id;

  var traits = reject({
    email: identify.email(),
    phone: identify.phone(),
    fullName: identify.name()
  });
  window.wigzo.identify(traits);
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Wigzo.prototype.track = function(track) {
  window.wigzo.track(track.event(), track.properties());
};

/**
 * Page.
 *
 * @param {Page} page
 */

Wigzo.prototype.page = function(page) {
  window.wigzo.track('page_segment', page.properties());
};

