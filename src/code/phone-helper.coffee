l = (require './log').instance()
iframePhone = require 'iframe-phone'

module.exports = class PhoneHelper
  @instances = {}
  @instance: ($iframe) ->
    @instances[$iframe] ?= new @ $iframe
    @instances[$iframe]

  @MessagesFromInteractives =
    "setLearnerUrl": false
    "interactiveState": false
    "getAuthInfo":
      message: "authInfo"
      data: "knowuh@gmail.com"
    "extendedSupport": false
    "htmlFragResponse": false

  restartPhone: ($iframe) ->
    if @iframePhone
      @iframePhone.hangup()
    @queue = []
    @already_setup  = false
    @iframePhone    = new iframePhone.ParentEndpoint($iframe[0], @phoneAnswered.bind(@))
    @iframePhoneRpc = new iframePhone.IframePhoneRpcEndpoint
      phone: @iframePhone
      namespace: 'lara-logging'

  constructor: ($iframe) ->
    @restartPhone($iframe)

  phoneAnswered: ->
    l.info("phone answered")
    if @already_setup
      return
    else
      @already_setup = true
      setupMessage = (inboundMessage, response) =>
        @iframePhone.addListener inboundMessage, (data) =>
          l.info "#{inboundMessage} called with: #{data}"
          $('#dataIn').html JSON.stringify(data, null, "  ")
          if response
            @iframePhone.post(response.message,response.data)

      setupMessage(inboundMessage,response) for inboundMessage,response of PhoneHelper.MessagesFromInteractives
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
