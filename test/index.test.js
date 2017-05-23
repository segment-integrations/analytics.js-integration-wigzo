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
        analytics.page();
        analytics.called(window.wigzo.index);
      });

      it('should pass page name and default properties via page', function() {
        analytics.page('Name');
        analytics.called(window.wigzo.index, {
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
        analytics.identify('user-id');
        analytics.called(window.wigzo.identify);
      });

      it('should send traits', function() {
        var user = {
          name: 'Test Name',
          email: 'ashish@wigzo.com',
          phone: '1234567890'
        };
        analytics.identify(user);
        analytics.called(window.wigzo.identify, {
          fullName: user.name,
          email: user.email,
          phone: user.phone
        });
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
    });
  });
});

