l = (require './log').instance()
Proxy = require './proxy'
Phone = require './phone-helper'

class Main
  constructor: (@x) ->
    @setUpButtons()
    @proxy  = new Proxy()
    @phone = Phone.instance($("#interactive-iframe"))

  setUpButtons: () ->
    buttons = "saveInteractive loadInteractive takeSnapshot
      htmlFragRequest getLearnerUrl getExtendedSupport"
    .split /\s+/
    
    bindButton = ($$,name) =>
      $$.on "click", (e) =>
        @proxy[name](e)

    for button in buttons
      functionName = button
      $b = $ "##{button}"
      l.info "loading button: #{button} → #{functionName}"
      bindButton($b,functionName)
  

m = new Main()
module.exports = Main