IframePhone = require "iframe-phone"

toggleForwardNav = ->
  enableForwardNav = true
  disableMessage = ""

  app = document.getElementById("app")
  render = (html) ->
    app.innerHTML = html

  renderApp = () ->
    if enableForwardNav
      state = "ENABLED"
      toggle = "DISABLE"
      messageValue = escape(disableMessage)
      message = "<div><input id='message' type='text' placeholder='Enter disable message here' value='#{messageValue}' /></div>"
    else
      state = "DISABLED"
      toggle = "ENABLE"
      message = ""
    render """
      <div>
        <div>Forward navigation is #{state}</div>
        #{message}
        <div><button>#{toggle}</button></div>
      </div>
    """

  if window.parent is window
    render "<span class='error'>This must be run within a LARA iframe interactive</span>"
    return

  render "Connecting to LARA..."
  iframePhone = new IframePhone.getIFrameEndpoint()

  iframePhone.addListener "initInteractive", () ->
    app.addEventListener "click", (e) ->
      if e.target.nodeName is "BUTTON"
        message = document.getElementById "message"
        enableForwardNav = !enableForwardNav
        iframePhone.post "navigation", {enableForwardNav: enableForwardNav, message: message?.value}
        renderApp()
    renderApp()

  iframePhone.initialize()

toggleForwardNav()