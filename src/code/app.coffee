l    = (require './log').instance()
Phone = require './phone-helper'


class App
  constructor: (@x) ->
    @setUpButtons()
    @phone = Phone.instance($("#interactive-iframe"))

  setUpButtons: () ->
    buttons =
      "saveInteractive": (e) =>
        l.warn "saveInteractive called in proxy"
        @phone.post "getInteractiveState"

      "loadInteractive": (e) =>
        l.warn "loadInteractive called in proxy"
        @phone.post "loadInteractive",$('dataOut').val()
      
      "htmlFragRequest": (e) =>
        l.warn "htmlFragRequest called in proxy"
        @phone.post "htmlFragRequest"
      
      "takeSnapshot": (e) =>
        l.warn "takeSnapshot called in proxy"
        @phone.post "takeSnapshot"
      
      "getLearnerUrl": (e) =>
        l.warn "getLearnerUrl called in proxy"
        @phone.post "getLearnerUrl"
      
      "getExtendedSupport": (e) =>
        l.warn "getExtendedSupport called in proxy"
        @phone.post "getExtendedSupport"
    
    bindButton = (name,f) =>
      l.info "binding button: #{name}"
      $elm = $ "##{name}"
      $elm.on "click", (e) => f(e)
    
    bindButton(buttonname, action) for buttonname, action of buttons
      
  
m = new App()
module.exports = App