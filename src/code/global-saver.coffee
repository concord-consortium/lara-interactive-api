# This is mostly a copy of the system in use on LARA as of April 13, 2015
# (on github) → http://bit.ly/1JE4phw
# This class implements two main functionalities:
# 1. Checks if global interactive state is availble on page load and if so,
#    it posts 'interactiveLoadGlobal' to all interactives (iframes).
# 2. When 'interactiveStateGlobal' message is received from any iframe, it:
#   2.1. posts 'interactiveLoadGlobal' message with a new state to all interactives
#        (except from sender of save message).
l = require 'loglevel'
iframePhone = require 'iframe-phone'

module.exports = class GlobalIframeSaver
  INTERACTIVES_SEL = 'iframe.interactive'

  constructor: (config) ->
    @_globalState = if config.raw_data then JSON.parse(config.raw_data) else null

    @_iframePhones = []
    $(INTERACTIVES_SEL).each (idx, iframeEl) =>
      phone = new iframePhone.ParentEndpoint $(iframeEl)[0], =>
        @addNewPhone phone

  addNewPhone: (phone) ->
    @_iframePhones.push phone
    @_setupPhoneListeners phone
    if @_globalState
      @_loadGlobalState phone

  _setupPhoneListeners: (phone) ->
    phone.addListener 'interactiveStateGlobal', (state) =>
      @_globalState = state
      @_broadcastGlobalState phone

  _loadGlobalState: (phone) ->
    phone.post 'loadInteractiveGlobal', @_globalState

  _broadcastGlobalState: (sender) ->
    @_iframePhones.forEach (phone) =>
      # Do not send state again to the same iframe that posted global state.
      @_loadGlobalState phone if phone isnt sender

window.GlobalIframeSaver = GlobalIframeSaver