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


/* AddToCart event */
var sendAddToCart = function(properties) {
  if (properties.hasOwnProperty('product_id')) {
    window.wigzo.track('addtocart', properties.product_id);
  }
};

/* Removed from cart event */
var sendRemovedFromCart = function(properties) {
  if (properties.hasOwnProperty('product_id')) {
    window.wigzo.track('removedfromcart', properties.product_id);
  }
};

/* Search event */
var sendSearchQuery = function(properties) {
  if (properties.hasOwnProperty('query')) {
    window.wigzo.track('search', properties.query);
  }
};

/* Checkout started event */
var sendCheckoutStartedEvent = function(properties) {
  if (properties.hasOwnProperty('products')) {
    var productList = properties.products;
    var addedProductIds = [];
    for (var i in productList) {
      if (productList.hasOwnProperty(i)) {
        addedProductIds.push(productList[i].product_id);
      }   
    }

    if (addedProductIds.length > 0) {
      window.wigzo.track('checkoutstarted', addedProductIds);
    }
  }
};

/* Buy event */
var sendBuyEvent = function(properties) {
  if (properties.hasOwnProperty('products')) {
    var productList = properties.products;
    var addedProductIds = [];
    for (var i in productList) {
      if (productList.hasOwnProperty(i)) {
        addedProductIds.push(productList[i].product_id);
      }  
    }

    if (addedProductIds.length > 0) {
      window.wigzo.track('buy', addedProductIds);
    }
  }
};

/* Product Review */
var sendProductReview = function(properties) {
  window.wigzo.track('review', properties);
};

/* Product Clicked */
var sendIndexProduct = function(properties) {
  var traits = reject({
    productId : properties.product_id,
    title: properties.name,
    price: properties.currency + ' ' + properties.price,
    category: properties.category,
    /* custom props */
    image: properties.imageUrl,
    canonicalUrl: properties.canonicalUrl,
    description: properties.description,
    language:properties.language
  });
  window.wigzo.index(traits);
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
  var props = track.properties();

  switch (track.event()) {
  /* Add To Cart */
  case 'Wishlist Product Added to Cart':
  case 'Product Added' :  sendAddToCart(props); break;
  /* Searched */
  case 'Products Searched' : sendSearchQuery(props); break;
  /* Removed from Cart  */
  case 'Product Removed' : sendRemovedFromCart(props); break;
  /* Checkout from Cart  */
  case 'Checkout Started' : sendCheckoutStartedEvent(props); break;
  /* Buy  */
  case 'Order Completed' : sendBuyEvent(props); break;
  /* Product Reviewed  */
  case 'Product Reviewed' : sendProductReview(props); break;
  /* Product Reviewed  */
  case 'Product Viewed' :
  case 'Product Clicked' : sendIndexProduct(props); break;
  default : 
    window.wigzo.track(track.event(), props);
  }
};


/**
 * Page.
 *
 * @param {Page} page
 */

Wigzo.prototype.page = function(page) {
  window.wigzo.track('page_segment', page.properties());
};