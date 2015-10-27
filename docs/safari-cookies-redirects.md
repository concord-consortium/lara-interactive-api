# Safari, cookies and iframe redirects

While recently debugging a weird authentication failure in an app that is regularly embedded within an iframe, I discovered some unexpected behavior in Safari with respect to how it handles cookies for the sites within the iframe.

The TL;DR is this: **Cookies will not be sent to the destination site of a 302 redirect** (the destination defined in the HTTP Location header), regardless of whether or not you've previously visited that site (unless the site is within the same main domain as the redirecting site).

Most of this behavior is due to the recent change of default settings in Safari. Under _Privacy_ -> _Cookies and website data_, the setting changed from _Allow from websites I visit_ to _Allow from current website only_.

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
