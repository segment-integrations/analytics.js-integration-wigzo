/*
 * These are the unit tests for the integration. They should NOT test the network nor any
 * remote third-party functionality - only that the local code acts and runs as expected.
 */

'use strict'

var Analytics = require('@segment/analytics.js-core').constructor
var Integration = require('@segment/analytics.js-integration')
var Sandbox = require('@segment/clear-env')
var Tester = require('@segment/analytics.js-integration-tester')
var Wigzo = require('../lib/')

describe('Wigzo', function () {
  var analytics
  var wigzo
  var options = {
	  orgToken: 'a30c8b5f-7514-4d23-a927-6e4d338920ec'
	}

  beforeEach(function () {
    analytics = new Analytics()
    wigzo = new Wigzo(options)
    analytics.use(Wigzo)
    analytics.use(Tester)
    analytics.add(wigzo)
  })

  afterEach(function () {
    analytics.restore()
    analytics.reset()
    wigzo.reset()
    Sandbox()
  })

  it('should have the right settings', function () {
    analytics.compare(Wigzo, Integration('Wigzo')
      .global('wigzo')
      .option('orgToken', ''));
  })

  describe('before loading', function () {
    beforeEach(function() {
      analytics.stub(wigzo, 'load');
      analytics.initialize();
      analytics.page();
    });

    describe('#initialize', function () {
      it('should create window.wigzo', function() {
        analytics.assert(window.wigzo);
      });

      it('should create window.wigzo.track', function() {
        analytics.assert(window.wigzo.track);
      });

      it('should create window.wigzo.index', function() {
        analytics.assert(window.wigzo.index);
      });

      it('should create window.wigzo.page', function() {
        analytics.assert(window.wigzo.page);
      });
    })
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

    describe('#page', function() {
      beforeEach(function() {
        analytics.stub(window.wigzo, 'page');
      });

      it('should call page', function() {
        analytics.page();
        analytics.called(window.wigzo.page);
      });

      it('should pass page name and default properties via page', function() {
        analytics.page('Name');
        analytics.called(window.wigzo.page, 'Name', {
          title: document.title,
          url: window.location.href,
          name: 'Name',
          path: window.location.pathname,
          referrer: document.referrer,
          search: window.location.search
        });
      });
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window.wigzo, 'identify');
      });

      it('should send an id', function() {
        analytics.identify('id');
        analytics.called(window.wigzo.identify, 'id');
      });

      it('should send traits', function() {
        analytics.identify({
          trait: true
        });
        analytics.called(window.wigzo.identify, {
          trait: true
        });
      });

      it('should send an id and traits', function() {
        analytics.identify('id', {
          trait: true
        });
        analytics.called(window.wigzo.identify, {
          trait: true,
          id: 'id'
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
        analytics.track('event', {
          property: true
        });
        analytics.called(window.wigzo.track, 'event', {
          property: true
        });
      });
    });
  });
})

