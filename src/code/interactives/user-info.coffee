IframePhone = require "iframe-phone"

showUserInfo = ->
  app = document.getElementById("app")
  render = (html) ->
    app.innerHTML = html

  if window.parent is window
    render "<span class='error'>This must be run within a LARA iframe interactive</span>"
    return

  render "Connecting to LARA..."

  # more info here...
  # http://concord-consortium.github.io/lara-interactive-api/docs/implementing-interactive/#iframe-phone-setup
  # and here
  # http://concord-consortium.github.io/lara-interactive-api/docs/implementing-interactive/#auth-info
  # the important note is to setup listeners before calling initialize
  iframePhone = new IframePhone.getIFrameEndpoint()

  iframePhone.addListener "authInfo", (user) ->
    email = if user.loggedIn then user.email else "anonymous"
    render "The current user is <span class='user-email'>#{email}</span>"

  iframePhone.initialize()

  # ask LARA for the user's auth info - it posts back the 'authInfo' message
  iframePhone.post "getAuthInfo"

showUserInfo()