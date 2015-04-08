l = (require './log').instance()
iframePhone = require 'iframe-phone'

module.exports = class DummyInteractive
  @instances = {}
  @instance: ($iframe) ->
    @instances[$iframe] ?= new @ $iframe
    @instances[$iframe]

  @MessageResponses =
    "getLearnerUrl":
      "message": 'setLearnerUrl'
      "data": 'http://blahblah.com'
    
    "getInteractiveState":
      "message": 'interactiveState'
      "data":
        "some": 'fake'
        "data": 'boo'
    
    "loadInteractive": false

    "getExtendedSupport":
      "message": "extendedSupport"
      "data":
        "opts": "none"
    
    "authInfo": false
    
  restartIframePhone: ($iframe) ->
    if @iframePhone
      @iframePhone.hangup()
      @iframePhone = null
  
    @iframePhone = new iframePhone.getIFrameEndpoint()
    addHandler = (message,response) =>
      @iframePhone.addListener message, (data) =>
        l.info "Phone call: #{message}: #{data}"
        if response
          @iframePhone.post(response.message, response.data)
          l.info "Phone responded: #{response.message} - #{response.data}"
    
    for message, response of DummyInteractive.MessageResponses
      addHandler(message,response)
      

    @iframePhone.initialize()
    l.info("Phone ready")

    # Not sure what to do RPC yet.
    # @iframePhoneRpc = new iframePhone.IframePhoneRpcEndpoint
    #   phone: @iframePhone
    #   namespace: 'lara-logging'

  constructor: () ->
    l.info("Starting the dummy iframe interactive")
    @restartIframePhone()
    $('#clear').click () ->
      $('#logger').html('')
    $('#getAuthInfo').click () =>
      l.info('posting getAuthInfo')
      @iframePhone.post("getAuthInfo")

  

new DummyInteractive()