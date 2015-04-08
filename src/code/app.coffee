l    = (require './log').instance()
Phone = require './phone-helper'


class App
  constructor: (@x) ->
    @setUpButtons()
    @phone = Phone.instance($("#interactive-iframe"))

  setUpButtons: () ->
    buttons =
      "saveInteractive": (e) =>
        l.warn "saveInteractive called"
        @phone.post "getInteractiveState"

      "loadInteractive": (e) =>
        l.warn "loadInteractive called"
        @phone.post "loadInteractive",$('dataOut').val()
      
      "htmlFragRequest": (e) =>
        l.warn "htmlFragRequest called"
        @phone.post "htmlFragRequest"
      
      "takeSnapshot": (e) =>
        l.warn "takeSnapshot called"
        @phone.post "takeSnapshot"
      
      "getLearnerUrl": (e) =>
        l.warn "getLearnerUrl called"
        @phone.post "getLearnerUrl"
      
      "getExtendedSupport": (e) =>
        l.warn "getExtendedSupport called"
        @phone.post "getExtendedSupport"
    
    bindButton = (name,f) =>
      l.info "binding button: #{name}"
      $elm = $ "##{name}"
      $elm.on "click", (e) => f(e)
    
    bindButton(buttonname, action) for buttonname, action of buttons
      
  
m = new App()
module.exports = App