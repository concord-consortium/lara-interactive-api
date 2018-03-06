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
      @iframePhone.disconnect()
      @iframePhone = null

    @iframePhone = new iframePhone.getIFrameEndpoint()
    addHandler = (message,response) =>
      @iframePhone.addListener message, (data) =>
        l.info "Phone call: #{message}: #{JSON.stringify data}"
        if response
          @iframePhone.post(response.message, response.data)
          l.info "Phone responded: #{response.message} - #{JSON.stringify response.data}"

    for message, response of MockInteractive.MessageResponses
      addHandler(message,response)

    @iframePhone.addListener 'loadInteractive', (data) ->
      l.info "Phone call: loadInteractive: #{JSON.stringify data}"
      $('#interactiveState').val JSON.stringify(data)

    @iframePhone.addListener 'getInteractiveState', (data) =>
      l.info "Phone call: getInteractiveState"
      @iframePhone.post('interactiveState', JSON.parse($('#interactiveState').val()))
      l.info "Phone responded: interactiveState"

    @iframePhone.addListener 'loadInteractiveGlobal', (data) ->
      l.info "Phone call: interactiveStateGlobal: #{JSON.stringify data}"
      $('#interactiveStateGlobal').val JSON.stringify(data)

    @iframePhone.addListener 'initInteractive', (data) ->
      l.info "Phone call: initInteractive: #{JSON.stringify data}"
      $('#interactiveState').val JSON.stringify(data.interactiveState) if data.interactiveState
      # prior to LARA 1.26 the authorState would come in as a string during authoring and
      # an object during runtime
      $('#authoredState').val @convertIfNecessary(data.authoredState) if data.authoredState
      $('#interactiveStateGlobal').val JSON.stringify(data.globalInteractiveState) if data.globalInteractiveState

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

    @postAndLog("supportedFeatures", {
      apiVersion: 1,
      features: {
        authoredState: true,
        interactiveState: true
      }
    })

    # TODO: (rpc)
    # @iframePhoneRpc = new iframePhone.IframePhoneRpcEndpoint
    #   phone: @iframePhone
    #   namespace: 'lara-logging'

  postAndLog: (msgType, data=null) ->
    @iframePhone.post(msgType, data)
    l.info("posted #{msgType}: #{JSON.stringify data}")

  convertIfNecessary: (objectOrString) ->
    if typeof objectOrString == 'String' then objectOrString else JSON.stringify(objectOrString)

  constructor: () ->
    l.info("Starting the dummy iframe interactive")
    @restartIframePhone()
    $('#clear').click () ->
      $('#logger').html('')

    $('#getAuthInfo').click () =>
      @postAndLog('getAuthInfo')

    $('#globalSaveState').click () =>
      @postAndLog("interactiveStateGlobal", JSON.parse($('#interactiveStateGlobal').val()))

    $('#saveAuthoredState').click () =>
      @postAndLog("authoredState", JSON.parse($('#authoredState').val()))

window.MockInteractive = MockInteractive
