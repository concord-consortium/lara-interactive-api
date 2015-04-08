l    = (require './log').instance()
iframePhone = require 'iframe-phone'

class App
  constructor: () ->
    @setUpButtons()
    @restartPhone($("#interactive-iframe"))

  setUpButtons: () ->
    buttons =
      "saveInteractive": (e) =>
        l.warn "saveInteractive called"
        @post "getInteractiveState"

      "loadInteractive": (e) =>
        l.warn "loadInteractive called"
        @post "loadInteractive",$('dataOut').val()
      
      "getLearnerUrl": (e) =>
        l.warn "getLearnerUrl called"
        @post "getLearnerUrl"
      
      "getExtendedSupport": (e) =>
        l.warn "getExtendedSupport called"
        @post "getExtendedSupport"

      # TODO:      
      # "htmlFragRequest": (e) =>
      #   l.warn "htmlFragRequest called"
      #   @post "htmlFragRequest"
      
      # "takeSnapshot": (e) =>
      #   l.warn "takeSnapshot called"
      #   @post "takeSnapshot"
      
      # TODO:
      # "lara-logging-present": (e) =>
      #   l.warn "getExtendedSupport called"
      #   @iframePhoneRpc.call message: 'lara-logging-present'
    
    bindButton = (name,f) =>
      l.info "binding button: #{name}"
      $elm = $ "##{name}"
      $elm.on "click", (e) => f(e)
  
    bindButton(buttonname, action) for buttonname, action of buttons

  ##
  ##
  restartPhone: ($iframe) ->
    if @iframePhone
      @iframePhone.hangup()
    @queue = []
    @already_setup  = false
    @iframePhone    = new iframePhone.ParentEndpoint($iframe[0], @phoneAnswered.bind(@))
    
    # TODO: (rpc)
    # @iframePhoneRpc = new iframePhone.IframePhoneRpcEndpoint
    #   phone: @iframePhone
    #   namespace: 'lara-logging'
  
  ##
  ##
  phoneAnswered: ->
    if @already_setup
      l.info("phone rang, but I already answerd")
    else
      l.info("phone answered")
      @already_setup = true
      @registerHandlers()

  ##
  ##
  registerHandlers: ->
    setupMessage = (inboundMessage, response) =>
      @iframePhone.addListener inboundMessage, (data) =>
        l.info "#{inboundMessage} called with: #{data}"
        $('#dataIn').html JSON.stringify(data, null, "  ")
        if response
          @iframePhone.post(response.message,response.data)

    messageHandlers =
      "setLearnerUrl": false
      "interactiveState": false
      "getAuthInfo":
        message: "authInfo"
        data: "knowuh@gmail.com"
      "extendedSupport": false
      "htmlFragResponse": false

    setupMessage(inboundMessage,response) for inboundMessage,response of messageHandlers
    @already_setup = true
    @post(msg.msg, msg.data) for msg in @queue


  ##
  ##
  post: (msg,data) ->
    if @already_setup
      l.info("posting message #{msg}")
      @iframePhone.post(msg,data)
    else
      l.info("queueing message #{msg}")
      @queue.push
        'msg': msg
        'data': data
  
m = new App()
module.exports = App