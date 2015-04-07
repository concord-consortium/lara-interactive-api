l = (require './log').instance()
Phone = require './iframe-phone-wrapper'

module.exports =  class Proxy
  constructor: () ->
    @phone = Phone.instance $("#interactive-iframe")
  saveInteractive: (e) ->
    l.warn "saveInteractive called in proxy"
    @phone.post "getInteractiveState"
  loadInteractive: (e) ->
    l.warn "loadInteractive called in proxy"
    @phone.post "loadInteractive",$('dataOut').val()

  htmlFragRequest: (e) ->
    l.warn "htmlFragRequest called in proxy"
    @phone.post "htmlFragRequest"

  takeSnapshot: (e) ->
    l.warn "takeSnapshot called in proxy"
    @phone.post "takeSnapshot"
  getLearnerUrl: (e) ->
    l.warn "getLearnerUrl called in proxy"
    @phone.post "getLearnerUrl"
  getExtendedSupport: (e) ->
    l.warn "getExtendedSupport called in proxy"
    @phone.post "getExtendedSupport"
  sendAuthInfo: (e) ->
    l.warn "sendAuthInfo called in proxy"
    @phone.post "sendAuthInfo"
