# Safari / IE, cookies and iframe redirects

While recently debugging a weird authentication failure in an app that is regularly embedded within an iframe, I discovered some unexpected behavior in Safari and IE with respect to how it handles cookies for the sites within the iframe.

The TL;DR is this: **Cookies will not be sent to the destination site of a 302 redirect** (the destination defined in the HTTP Location header), regardless of whether or not you've previously visited that site (unless the site is within the same main domain as the redirecting site).

In Safari, most of this behavior is due to the recent change of default settings. Under _Privacy_ -> _Cookies and website data_, the setting changed from _Allow from websites I visit_ to _Allow from current website only_.

There doesn't seem to be a setting around this behavior in IE.

## Example

Our app uses OAuth2 to sign in via a different app. The sign in process involves several redirects (these aren't the actual domains/paths, but roughly the same steps):

    Request                            Response
    GET:  https://app.com/login        302: https://sso.com/sso/login
    GET:  https://sso.com/sso/login    200
    POST: https://sso.com/sso/login    302: https://app.com/sso/callback
    GET:  https://app.com/sso/callback 302: https://app.com/

This all works fine in Safari when accessing app.com in a top-level window. However, this all breaks down when running within an iframe.

It turns out that Safari will _not_ send cookies to _sso.com_ in the 2nd request, and additionally will _not_ send cookies to _app.com_ in the 4th request. The whole sign in process relies on maintaining consistent sessions, so when no cookies are sent, the sign in doesn't take, and the user is left on app.com in a logged out state.

## Workarounds

1. I haven't been able to test this, but supposedly you can work around this cookie behavior by rendering a page which redirects via the page content, rather than redirecting via a 302 response with a _Location_ header.

        <html>
          <head>
            <title>Sign In</title>
            <meta http-equiv="refresh" content="0;URL='https://sso.com/sso/login'" />
          </head>
          <body>
            <p>This page has moved to a <a href="https://sso.com/sso/login">new location</a>.</p>
          </body>
        </html>

    However, you'll have to take care that the request to the other site is essentially the same (Referrer, Origin, etc all present the same info).

1. Also, Safari's definition of _current website_ is a bit loose when it comes to the hostname. foo.app.com is considered the same site as bar.app.com. We were fortunate enough to be able to use this tactic to bring our app into the same "site" as the sso provider, but that's not usually possible when working with a 3rd-party provider.

1. If your redirecting code makes a full round-trip, another option is to do all of your redirecting in a separate window. Use Javascript to open a window, and then monitor its url. Once the url is back to the location you're expecting, close the window and reload the iframe page.

    The library is here:

        // A wrapper around having an external link pop up in its own window, and then automatically monitoring it
        // and closing it when it returns to the same domain as the current page.

        window.inIframe = function() {
          try {
              return window.self !== window.top;
          } catch (e) {
              return true;
          }
        };

        window.AutomaticallyClosingPopupLink = {
          configure: function($link, directUrl, popupUrl, afterCloseUrl) {
            var onClick = function() {
              if (window.inIframe()) {
                // Pop up the url in a new window
                // Monitor it and close it when done
                // Redirect the current page when closed
                this._popupWindow($link.id, popupUrl, afterCloseUrl);
              } else {
                window.location.href = directUrl;
              }
            }.bind(this);
            $link.on('click', onClick);
          },

          // This code was adapted from CODAP's implementation of a similar feature
          _popupWindow: function(id, popupUrl, afterCloseUrl) {
            var width  = 800,
                height = 480,
                position = this._computeScreenLocation(width, height),
                windowFeatures = [
                  'width=' + width,
                  'height=' + height,
                  'top=' + position.top || 200,
                  'left=' + position.left || 200,
                  'dependent=yes',
                  'resizable=no',
                  'location=no',
                  'dialog=yes',
                  'menubar=no'
                ],
                exceptionCount = 0,
                panel = window.open(popupUrl, id, windowFeatures.join()),
                checkPanelHref = function() {
                  try {
                    /* This is a bit of a hack. Accessing a popup's location throws a security exception
                     * when the url is cross-origin. Therefore, 1) this should only be used with urls that are         cross-origin, and 2) the url
                     * should eventually return to a non-cross-origin url at the time the window should be closed.
                     */
                    var href = panel.location.href; // This will throw an exception if the url is still cross-origin.

                    // If exceptionCount is not 0, then we hit an external url and came back. Assume that we're done.
                    // If it's still 0, then keep waiting for the url to change to something external and change back.
                    if (exceptionCount > 0) {
                      window.clearInterval(timer);
                      panel.close();
                      if (afterCloseUrl) {
                        document.location = afterCloseUrl;
                      } else {
                        document.location.reload();
                      }
                    }
                  } catch(e) {
                    exceptionCount++;
                  }
                },
                timer = window.setInterval(checkPanelHref, 200);
          },

          _computeScreenLocation: function(w, h) {
            // Fixes dual-screen position                         Most browsers      Firefox
            var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
            var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

            var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ?         document.documentElement.clientWidth : screen.width;
            var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

            var left = ((width / 2) - (w / 2)) + dualScreenLeft;
            var top = ((height / 2) - (h / 2)) + dualScreenTop;
            return {left: left, top: top};
          }
        };

    And it's used via this code in the page:

        jQuery(function() {
          var button = jQuery('#login_button'),
              path = '/login',
              popup = '/popupLogin',
              redirect = '/';

          window.AutomaticallyClosingPopupLink.configure(button, path, popup, redirect);
        });
