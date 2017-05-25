/*
 * These are the unit tests for the integration. They should NOT test the network nor any
 * remote third-party functionality - only that the local code acts and runs as expected.
 */

'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var Wigzo = require('../lib/');

describe('Wigzo', function() {
  var analytics;
  var wigzo;
  var options = {
    orgToken: 'a30c8b5f-7514-4d23-a927-6e4d338920ec'
  };

  beforeEach(function() {
    analytics = new Analytics();
    wigzo = new Wigzo(options);
    analytics.use(Wigzo);
    analytics.use(tester);
    analytics.add(wigzo);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    wigzo.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(Wigzo, integration('Wigzo')
      .global('wigzo')
      .option('orgToken', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(wigzo, 'load');
      analytics.initialize();
      analytics.page();
    });

    describe('#initialize', function() {
      it('should create window.wigzo', function() {
        analytics.assert(window.wigzo);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(wigzo, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.initialize();
      analytics.page();
      analytics.once('ready', done);
    });

    it('should create window.wigzo.identify', function() {
      analytics.assert(window.wigzo.identify);
    });

    it('should create window.wigzo.track', function() {
      analytics.assert(window.wigzo.track);
    });

    it('should create window.wigzo.index', function() {
      analytics.assert(window.wigzo.index);
    });

    describe('#index', function() {
      beforeEach(function() {
        analytics.stub(window.wigzo, 'index');
      });

      it('should call index', function() {
        var productData = {
          product_id: '40',
          canonicalUrl : 'https://snoopy.wigzopush.com/index.php?route=product/product&amp;product_id=40',
          imageUrl : 'https://snoopy.wigzopush.com/image/cache/catalog/demo/iphone_1-228x228.jpg',
          category: 'Mobile Phones',
          description: 'iPhone is a revolutionary new mobile phone that allows you',
          language: 'en',
          name: 'iPhone',
          brand: 'Apply',
          price: 18.99,
          currency: 'usd'
        };

        var wigzoProduct = {
          productId: productData.product_id,
          title: productData.name,
          price : productData.currency + ' ' + productData.price,
          category: productData.category,
          image : productData.imageUrl,
          canonicalUrl : productData.canonicalUrl,
          description: productData.description,
          language: productData.language
        };

        analytics.track('Product Clicked', productData);
        analytics.called(window.wigzo.index, wigzoProduct);
      });
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window.wigzo, 'identify');
      });

      it('should send an id', function() {
        analytics.identify('user-id');
        analytics.called(window.wigzo.identify);
      });

      it('should send traits', function() {
        var user = {
          name: 'Test Name',
          email: 'ashish@wigzo.com',
          phone: '1234567890'
        };

        var wigzoUser = {
          fullName: user.name,
          email: user.email,
          phone: user.phone
        };
        
        analytics.identify(user);
        analytics.called(window.wigzo.identify, wigzoUser);
      });

      it('should send an id and traits', function() {
        var user = {
          name: 'Test Name',
          email: 'ashish@wigzo.com',
          phone: '1234567890'
        };
        var id = '507f191e810c19729de860ea';

        analytics.identify(id, user);
        analytics.called(window.wigzo.identify,{
          fullName: user.name,
          email: user.email,
          phone: user.phone
        });
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window.wigzo, 'track');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called(window.wigzo.track, 'event', {});
      });

      it('should send an event and properties', function() {
        var eventData = {
          property1 : 'test1',
          property2 : 'test2'
        };

        analytics.track('event', eventData);
        analytics.called(window.wigzo.track, 'event', eventData);
      });

      it('should send addtocart', function() {
        var eventData = {
          product_id: '507f1f77bcf86cd799439011'
        };
        analytics.track('Product Added', eventData);
        analytics.called(window.wigzo.track, 'addtocart', eventData.product_id);
      });

      it('should not send addtocart without product_id', function() {
        var eventData = {
          name: 'Monopoly: 3rd Edition',
          brand: 'Hasbro'
        };
        analytics.track('Product Added', eventData);
        analytics.didNotCall(window.wigzo.track, 'addtocart');
      });

      it('should send wishlist', function() {
        var eventData = {
          product_id: '507f1f77bcf86cd799439011'
        };
        analytics.track('Product Added to Wishlist', eventData);
        analytics.called(window.wigzo.track, 'wishlist', eventData.product_id);
      });

      it('should not send wishlist without product_id', function() {
        var eventData = {
          name: 'Monopoly: 3rd Edition',
          brand: 'Hasbro'
        };
        analytics.track('Product Added to Wishlist', eventData);
        analytics.didNotCall(window.wigzo.track, 'wishlist');
      });

      it('should send search', function() {
        var eventData = {
          query: 'blue hotpants'
        };

        analytics.track('Products Searched', eventData);
        analytics.called(window.wigzo.track, 'search', eventData.query);
      });

      it('should not send search without query', function() {
        var eventData = {
          text: 'blue hotpants'
        };

        analytics.track('Products Searched', eventData);
        analytics.didNotCall(window.wigzo.track, 'search');
      });

      it('should send product removed', function() {
        var eventData = {
          product_id: '507f1f77bcf86cd799439011',
          sku: 'G-32'
        };

        analytics.track('Product Removed', eventData);
        analytics.called(window.wigzo.track, 'removedfromcart', eventData.product_id);
      });

      it('should not send product removed without product_id', function() {
        var eventData = {
          name: 'Monopoly: 3rd Edition',
          sku: 'G-32'
        };

        analytics.track('Product Removed', eventData);
        analytics.didNotCall(window.wigzo.track, 'removedfromcart');
      });

      it('should send product reviewed', function() {
        var eventData = {
          product_id: '507f1f77bcf86cd799439011',
          review_id: 'kdfjrj39fj39jf3',
          review_body: 'I love this product',
          rating: '5'
        };

        analytics.track('Product Reviewed', eventData);
        analytics.called(window.wigzo.track, 'review', eventData);
      });

      it('should send checkout started', function() {
        var productIdList = ['507f1f77bcf86cd799439011', '505bd76785ebb509fc183733'];
        var eventData = {
          products: [
            { product_id: productIdList[0] },
            { product_id: productIdList[1] }
          ]
        };

        analytics.track('Checkout Started', eventData);
        analytics.called(window.wigzo.track, 'checkoutstarted', productIdList);
      });

      it('should not send checkout started without product_id', function() {
        var eventData = {
          order_id: '50314b8e9bcf000000000000',
          affiliation: 'Google Store'
        };

        analytics.track('Checkout Started', eventData);
        analytics.didNotCall(window.wigzo.track, 'checkoutstarted');
      });

      it('should send order completed', function() {
        var productIdList = ['507f1f77bcf86cd799439011', '505bd76785ebb509fc183733'];
        var eventData = {
          products: [
            { product_id: productIdList[0] },
            { product_id: productIdList[1] }
          ]
        };

        analytics.track('Order Completed', eventData);
        analytics.called(window.wigzo.track, 'buy', productIdList);
      });

      it('should not send order completed without product_id', function() {
        var eventData = {
          order_id: '50314b8e9bcf000000000000',
          affiliation: 'Google Store'
        };

        analytics.track('Order Completed', eventData);
        analytics.didNotCall(window.wigzo.track, 'buy');
      });
    });
  });
});

