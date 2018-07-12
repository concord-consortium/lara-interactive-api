# LARA Interactive API

Table of contents:

[TOC]

## Startup and Initialization

LARA interactive iframes communicate by using [iFramePhone](https://github.com/concord-consortium/iframe-phone) through three scripts loaded by the server in the browser:  [iframe-saver.coffee](https://github.com/concord-consortium/LARA/blob/master/app/assets/javascripts/iframe-saver.coffee),
[global-iframe-saver.coffee](https://github.com/concord-consortium/LARA/blob/master/app/assets/javascripts/global-iframe-saver.coffee) and
[logger.js](https://github.com/concord-consortium/lara/blob/b51f764600816844088a0d45dc4493c0510eefe0/app/assets/javascripts/logger.js).  The LARA logging service also uses iFramePhones [RPC endpoint](https://github.com/concord-consortium/iframe-phone/blob/master/lib/iframe-phone-rpc-endpoint.js) to log events from the interactives.

The iframe-saver.coffee script first listens for the iFramePhone to connect and registers the message handlers documented below, then sends separate `getExtendedSupport` and `getLearnerUrl`
requests to the client and finally calls back to the LARA server to get the current interactive state.  If there is existing interactive state the client will receive a `loadInteractive` message with the current interactive state as the parameter to the message.  However if no previous interactive state is found on the server the client will **not** receive a callback.  To allow interactives to have a
consistent startup a new message was added, `initInteractive` (documented below), which is always sent to the client after the server is queried for the interactive state by iframe-saver.coffee.

The global-iframe-saver.coffee script sets up a listener for the `interactiveStateGlobal` message and sends one message: `loadInteractiveGlobal`.

The logger.js sets up a listener for the `log` message.

Since the three scripts above and the interactive's code are both running in the browser we will use the term server to mean the code in scripts interfacing with LARA above and client to be the interactive.

## iframe-saver.coffee Messages

The client-side API can be split into two parts: messages initiated by the server to inform the client or request data back from the client and those initiated by the client to inform the server or request data back from the server.  Some of the messages from the client can be both responses to the server when it queries for information and requests to the server to set that information.

### getExtendedSupport

Sent automatically by the server at startup to query the client about their `extendedSupport` status.  This is the first message the client will receive and is sent before the call is made to
the server to get the interactive state.  It has no payload data.

### extendedSupport

Can be thought of as `setExtendedSupport`. Sent by the client either in response to receiving a `getExtendedSupport` message or can be initiated by the client.  The payload for the message is an object with the following structure: `{reset: <boolean>}`.  If `reset` is true, we will allow the user to 'reset' the interactive via the _delete_ button in the LARA runtime.

### getLearnerUrl

**DEPRECATED** instead you should use the messages that save and load interactive state: `initInteractive`, `getInteractiveState`, `interactiveState`

Sent automatically by the server at startup to query the client about their learner url (the client responds via `setLearnerUrl`).  This is the second message the client will receive and is sent before the call is made to the server to get the interactive state.  It has no payload data.

### setLearnerUrl

**DEPRECATED** instead you should use the messages that save and load interactive state: `initInteractive`, `getInteractiveState`, `interactiveState`

Sent by the client either in response to receiving a `getLearnerUrl` message or can be initiated by the client. The payload for the message is the string that denotes exact URL for the current student.

### getInteractiveState

Sent automatically by the server every 5 seconds to query the client about their interactive state. It has no payload data.

This is also sent by LARA before changing pages.  The client must respond with `initInteractive`.

**IMPORTANT** If the client does not respond with the `interactiveState` message then LARA will not change pages.

### interactiveState

Can be thought of as `setInteractiveState`. Sent by the client either in response to receiving a `getInteractiveState` message or can be initiated by the client.  The payload for the message is an arbitrary serializable object that will be stored by the LARA server.

### getAuthInfo

Sent by the client to the server to request the current users authentication information.  It has no payload data.

### authInfo

Sent by the server only in response to a `getAuthInfo` request by the client.  The payload is the object `{provider: <string>, loggedIn: <boolean>, email: <string>}` where `provider` and `loggedIn`
are always set and `email` is only set if the user has an email address.

### loadInteractive

**DEPRECATED** The `initInteractive` message includes the state, and should be used to get the state instead.

Sent by the server at startup after the LARA server is queried about the interactive's state and *only* if the interactive has state.  The payload for the message is a arbitrary serialized object
previously set by the `interactiveState` message.

### initInteractive

Sent by the server at startup after the LARA server is queried about the interactive's state.  This message will always be sent, even if there is an error querying the server about the interactive state.

See the [initInteractive section in Implementing Interactive](implementing-interactive.md#handling-the-initinteractive-message) for details.

## global-iframe-saver.coffee Messages

#### interactiveStateGlobal

Sent by the client to the server and sets the global state that should be shared with all the interactives embedded in the current activity for the current student.  The payload for the message is
an arbitrary serializable object. The global state is saved in database as text (stringified JSON) and LARA does not care about its content.

Once this message is received, the server immediately posts `loadInteractiveGlobal` to all interactives on the same page (except from the sender of the original save message).

#### loadInteractiveGlobal

Sent by the server to all interactives on the current page (for current activity and student).  The payload for the message is an arbitrary serialized object.  It's interactive responsibility to interpret this message and load (or not) the given state.

This message is sent by the server when:

- The `interactiveStateGlobal` message is received by the server
- The activity page is loaded **and** the global interactive state is available in LARA activity run (so only if `interactiveStateGlobal` has been received earlier)

## logger.js Messages

### log

This message proxies communication from the interactive → LARA → Logging server.  There is only one way communication between the interactive and LARA. The interactive is expected to post following messages using iframe phone:

```javascript
phone.post('log', {action: 'actionName', data: {someValue: 1, otherValue: 2})
```

LARA listens to these events only when logging is enabled (they will be ignored otherwise). When a `log` message is received, LARA issues a POST request to the Logging server. LARA uses provided action name and data, but also adds additional information to the event (context that might useful for researchers, e.g. user name, activity name, url, session ID, etc.).
