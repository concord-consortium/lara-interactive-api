l    = (require './log').instance()
_    = (require 'lodash')
iframePhone = require 'iframe-phone'

class App
  constructor: () ->
    @setUpButtons()
    @bindShutterbug()
    @setupInputWatchers()
    @restartPhone($("#interactive-iframe"))
    @globalState = {}
    
  setSource: (src) ->
    $src    = $("#interactiveSource")
    $iframe = $("#interactive-iframe")
    @src = src
    $src[0].value = @src
    $iframe.attr('src', @src)
    @restartPhone($("#interactive-iframe"))

  setupInputWatchers: () ->
    $src    = $("#interactiveSource")
    $iframe = $("#interactive-iframe")
    @setSource($iframe.attr('src'))
    $src.change (e) =>
      @setSource(e.target.value)
    $(".interactiveLink").click (e) =>
      e.preventDefault()
      @setSource($(e.target).attr('href'))


  setUpButtons: () ->
    buttons =
      "saveInteractive": (e) =>
        l.warn "saveInteractive called"
        @post "getInteractiveState"

      "loadInteractive": (e) =>
        value = $('#dataOut').val()
        obj = JSON.parse(value) # TODO This has to be an object...
        l.warn "loadInteractive #{value} called"
        @post "loadInteractive", obj
      
      "getLearnerUrl": (e) =>
        l.warn "getLearnerUrl called"
        @post "getLearnerUrl"
      
      "getExtendedSupport": (e) =>
        l.warn "getExtendedSupport called"
        @post "getExtendedSupport"

      "getExtendedSupport": (e) =>
        l.warn "getExtendedSupport called"
        @post "getExtendedSupport"

      "loadInteractiveGlobal": (e) =>
        value = $('#dataOut').val()
        if value.length < 1
          value = "{'fake': 'data', 'for': 'you'}"
        l.warn "loadInteractiveGlobal #{value} called"
        @post "loadInteractiveGlobal", value

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
  bindShutterbug: ->
    source = "#interactive-iframe"
    dest   = "#snapshot"
    $button = $("#takeSnapshot")
    $button.click () ->
      if window.Shutterbug
        Shutterbug.snapshot
          selector: source
          dstSelector: dest
          done: () ->
            l.info("snapshot taken")
          fail: () ->
            l.info("snapshot fail") 
          server: "//snapshot.concord.org/shutterbug"
      else
        alert "shutterbug.js must be installed on the page"
    
  ##
  ##
  restartPhone: ($iframe) ->
    if @iframePhone
      @iframePhone.disconnect()
      @iframePhone = null
    @queue = []
    @already_setup  = false
    @iframePhone = new iframePhone.ParentEndpoint($iframe[0], @phoneAnswered.bind(@))
    
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
        if response and response.message
          @iframePhone.post(response.message,response.data)
        if response and response.handler
          response.handler(data)

    messageHandlers =
      "setLearnerUrl": false
      "interactiveState": false
      "getAuthInfo":
        message: "authInfo"
        data: "knowuh@gmail.com"
      "extendedSupport": false
      "htmlFragResponse": false
      "interactiveStateGlobal":
        handler: (data) =>
          @globalState = _.extend(@globalState,data)

    setupMessage(inboundMessage,response) for inboundMessage,response of messageHandlers
    @already_setup = true
    @post(msg.msg, msg.data) for msg in @queue


  ##
  ##
  post: (msg,data) ->
    if @already_setup
      l.info("posting message #{msg} #{data}")
      @iframePhone.post(msg,data)
    else
      l.info("queueing message #{msg} #{data}")
      @queue.push
        'msg': msg
        'data': data


window.App = App
module.exports = App