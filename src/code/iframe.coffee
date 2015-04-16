l = (require './log').instance()
iframePhone = require 'iframe-phone'

module.exports = class MockInteractive
  @instances = {}
  @instance: ($iframe) ->
    @instances[$iframe] ?= new @ $iframe
    @instances[$iframe]

  @MessageResponses =
    "getLearnerUrl":
      "message": 'setLearnerUrl'
      "data": window.location.href
    
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
    
    for message, response of MockInteractive.MessageResponses
      addHandler(message,response)
    
    @iframePhone.addListener 'loadInteractive', (data) =>
      l.info "Phone call: loadInteractive: #{data}"
      $('#interactiveState').val JSON.stringify(data)

    @iframePhone.addListener 'getInteractiveState', (data) =>
      l.info "Phone call: getInteractiveState"
      @iframePhone.post('interactiveState', JSON.parse($('#interactiveState').val()))
      l.info "Phone responded: interactiveState"

    @iframePhone.addListener 'loadInteractiveGlobal', (data) =>
      l.info "Phone call: interactiveStateGlobal: #{data}"
      $('#interactiveStateGlobal').val JSON.stringify(data)

    # Logging
    logTheLogMessages = (message, callback) ->
      if message
        l.info "Logging RPC call: #{message.message}"
      callback

    loggingChannel = new iframePhone.IframePhoneRpcEndpoint
      handler: logTheLogMessages
      namespace: 'lara-logging'
      targetWindow: window.parent
      phone: @iframePhone

    @iframePhone.initialize()
    l.info("Phone ready")

    # TODO: (rpc)
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
    
    $('#globalSaveState').click () =>
      l.info('posting interactiveStateGlobal')
      @iframePhone.post("interactiveStateGlobal", JSON.parse($('#interactiveStateGlobal').val()))
  
window.MockInteractive = MockInteractive
