l = (require './log').instance()
iframePhone = require 'iframe-phone'

module.exports = class IFramePhoneWrapper
  @instances = {}
  @instance: ($iframe) ->
    @instances[$iframe] ?= new @ $iframe
    @instances[$iframe]

  @KNOWN_PARENT_MSGS =
    "
      setLearnerUrl interactiveState getAuthInfo extendedSupport
      htmlFragResponse
    ".split /\s+/  

  restart: ($iframe) ->
    if @iframePhone
      @iframePhone.hangup()
    @listeners = {}
    @queue = []
    @already_setup = false
    @iframePhone = new iframePhone.ParentEndpoint($iframe[0], @phone_answered.bind(@))


    @iframePhoneRpc = new iframePhone.IframePhoneRpcEndpoint
      phone: @iframePhone
      namespace: 'lara-logging'  

  constructor: ($iframe) ->
    @restart($iframe)

  handlePhoneMessage: (msg, data, args)->
    l.info "#{msg} called with: #{data}"
    $('#dataIn').html JSON.stringify(data, null, "  ")
    if @listeners[msg]
      listener(msg, data) for listener in @listeners[msg]
    
  addListener: (msg, func) ->
    @listeners[msg] ?= []
    @listeners[msg].push func

  phone_answered: ->
    l.info("phone answered")
    return if @already_setup ?
      @already_setup = true
      setupMessage = (parentMessage) =>
        @iframePhone.addListener parentMessage, (data) =>
          @handlePhoneMessage(parentMessage, data, arguments)

      setupMessage(parentMessage) for parentMessage in IFramePhoneWrapper.KNOWN_PARENT_MSGS
      @addWindowListener()
      @already_setup = true
      @post(msg.msg, msg.data) for msg in @queue

  post: (msg,data) ->
    if @already_setup
      l.info("posting message #{msg}")
      @iframePhone.post(msg,data)
    else
      l.info("queueing message #{msg}")
      @queue.push
        'msg': msg
        'data': data
  formatMsg: (msg) ->
    message = ""
    try
      if typeof msg != "string"
        message = JSON.stringify(msg, null, "  ")
      else
        message = msg
      message = "Received message: #{message}"
    catch error
      message = "Error: #{error}"
    message

  receiveMessage: (msg) =>
    l.info @formatMsg(msg)

  addWindowListener: () ->
    window.addEventListener "message", @receiveMessage.bind(@), false

