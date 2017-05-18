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
  var options = {}

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

  describe('Constructing the integration', function () {
    it('should have the right settings', function () {
      analytics.compare(Wigzo, Integration('Wigzo')
    })
  })

  describe('#initialize', function () {
    it('should call this.ready() with valid options', function () {
      analytics.stub(wigzo, 'ready')
      wigzo.initialize()
      analytics.called(wigzo.ready)
    })

    it('should prepare the needed globals', function () {
    })
  })
})
