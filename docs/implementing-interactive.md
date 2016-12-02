# Implementing Interactive

LARA embeds interactives using iframe and provides LARA Interactive API. This API can be used e.g. to customize interactive,
save state authored by teachers or save student progress. The whole communication between LARA and Interactive
happens through [iFramePhone](https://github.com/concord-consortium/iframe-phone) which is a simple wrapper around 
`postMessage` API. Interactive which wants to use LARA Interactive API needs to use this library. Check its 
readme to see how to include it in your project (npm, RequireJS or via script tag). Once `iframePhone` library is 
available, Interactive needs to setup communication:

### iframe-phone setup
```javascript
var phone = iframePhone.getIFrameEndpoint();
phone.addListener('initInteractive', function (data) {
  // handle initInteractive call
});
phone.addListener('otherMessageType', function (data) {
  // handle otherMessageType call
});
// more handlers here

// IMPORTANT: Initialize connection after all message listeners are added!
phone.initialize();
// Inform LARA about supported features. Some of them require that
//  (e.g. state authoring, student progress saving):
phone.post('supportedFeatures', {
  apiVersion: 1,
  features: {
    someFeature: true
    otherFeature: true
  }
});
```

### Handling the `initInteractive` message

This is one of the most important messages sent by LARA. It provides most of the information stored by LARA.
It tells the interactive what is the current API version, mode (`runtime` or `authoring`), `authoredState`
(state defined by teacher), `interactiveState` (state based on student work) and so on. Interactive should
add `initInteractive` handler that reads values stored in `data` Object / hash:

```javascript
phone.addListener('initInteractive', function (data) {
  // process data object, e.g.:
  initializeMode(data.mode);
  loadAuthoredState(data.authoredState);
  loadStudentWork(data.interactiveState);
});
```

#### Data passed to initInteractive

 - **error** - `null` if everything is okay, error message otherwise (e.g. data fetching might fail).
 - **mode** - `"authoring"` or `"runtime"`. Interactive can be displayed in one of those two modes, but it's
   up to interactive whether it supports authoring mode. Runtime is basic mode which is presented to students.
   Authoring mode can be used by authors to customize interactive.
 - **authoredState [optional]** - JSON that has been saved by interactive earlier in authoring mode using
   `authoredState` message (described below in other section). If it's not defined, it would be falsy value
   (null or empty string).
 - **interactiveState [optional]** - JSON that has been saved by interactive earlier in runtime mode using
   `interactiveState` message (described below in other section). Provided only in runtime mode. If it's not
   defined, it would be falsy value (null or empty string).
 - **globalInteractiveState [optional]** - JSON that has been saved by interactive earlier in runtime mode
   using `globalInteractiveState` message (described below in other section). Provided only in runtime mode.
   If it's not defined, it would be falsy value (null or empty string).
 - **hasLinkedInteractive [optional]** - TODO
 - **linkedState [optional]** - TODO
 - **interactiveStateUrl [optional]** - TODO
 - **collaboratorUrls [optional]** - TODO


### Interactive customization

If interactive wants to support customization, it should inform LARA about it using `supportedFeatures` message:

```javascript
phone.post('supportedFeatures', {
  apiVersion: 1,
  features: {
    authoredState: true
    // + other supported features
  }
});
```

`initInteractive` message provides `mode` property. Interactive can display authoring interface when mode value
is equal to `"authoring"`. Every customization made by author should be sent back to LARA using `authoredState`
message:

```javascript
phone.post('authoredState', data);
```

The authoredState data should be a JSON compatible object, that is the only requirement.
Next time the interactive is loaded either in authoring or runtime mode, `initInteractive` will provide this
state to the interactive in `authoredState` property.
Note that it's recommended that `authoredState` should be sent to LARA immediately after every change. LARA provides
its own "Save" button that would actually save this state to the DB and "Reset" which would set it back to null.

### Saving student progress

If interactive wants to support student progress saving, it should inform LARA about it using `supportedFeatures` message:

```javascript
phone.post('supportedFeatures', {
  apiVersion: 1,
  features: {
    interactiveState: true
    // + other supported features
  }
});
```

Currently, LARA is not paying attention to this interactiveState supportedFeature, but it will do so in the future.

When this interactive is added to a LARA page the author needs to check the "save state" checkbox.

`initInteractive` provides `mode` property. `"runtime"` mode means that Interactive is viewed by student. Interactive
 can save student progress using `interactiveState` message:

```javascript
phone.post('interactiveState', data);
```

Normally the interactiveState data should be a JSON compatible object, that is the only requirement.
Next time the interactive is loaded in runtime mode, `initInteractive` will provide this state to the interactive
in `interactiveState` property.

LARA will send the interactive a `getInteractiveState` periodically:

- every 5 seconds
- on window focus
- iframe mouseout
- when the student tries to leave the page containing the interactive

So the interactive should add an listener for `getInteractiveState`. To be safe, remember to add the listener before
calling `phone.initialize();`. Here is an example listener:

```javascript
phone.addListener('getInteractiveState', function (data) {
  phone.post('interactiveState', interactiveState);
});
```

**IMPORTANT** When the student tries to leave the page with the interactive, the interactive needs to respond with
an `interactiveState` message. LARA will not changes pages until it receives this message.

There is a special value `"nochange"`, that can be sent as the interactiveState data. This tells LARA the
interactiveState has not changed since the last time. This is useful when responding to getInteractiveState

### Custom learner URL

**DEPRECATED** This feature is related to student progress saving. Interactive can provide versioned URL to make sure that given
data format is always supported (otherwise, e.g. interactive can be updated, but LARA would still try to load old data format).

```javascript
phone.post('setLearnerUrl', 'https://my.example.interactive/version/1');
```

### Global interactive state

A few interactives can share one, global state within a single LARA activity. E.g. you can let students work on the
same model on different pages of the activity. Interactive can set global state using `interactiveStateGlobal` message:

```javascript
phone.post('interactiveStateGlobal', globalState);
```

Once this message is received, the server immediately posts `loadInteractiveGlobal` to all interactives on the same page
(except from the sender of the original save message). So, interactives can listen to this message:

```javascript
phone.addListener('loadInteraciveGlobal', function (globalState) {
  // Process global state, e.g.:
  loadState(globalState);
});
```

Also, if global state is available for the activity (so, one of the interactives has sent `interactiveStateGlobal` message before),
it will be provided in `initInteractive` message.

### Logging

This message proxies communication from the interactive → LARA → Logging server.
There is only one way communication between the interactive and LARA. The interactive is expected to post following messages using
iframe phone:

```javascript
phone.post('log', {action: 'actionName', data: {someValue: 1, otherValue: 2}});
```

LARA listens to these events only when logging is enabled (they will be ignored otherwise). 
When a `log` message is received, LARA issues a POST request to the Logging server. LARA uses provided action name and data, 
but also adds additional information to the event (context that might useful for researchers, e.g. user name, activity name, url, session ID, etc.).


### Auth info

Interactive can ask LARA about the current users authentication information using `getAuthInfo` message. It has no payload data:

```javascript
phone.post('getAuthInfo');
```

LARA responds using `authInfo` message:

```javascript
phone.addListener('authInfo', function (info) {
  // ...
});  
```

The payload is the object `{provider: <string>, loggedIn: <boolean>, email: <string>}` where `provider` and `loggedIn`
are always set and `email` is only set if the user has an email address.

### getExtendedSupport

TODO

PJ: do we really want to document and support these messages / feature? 
 
I know it's implemented, but it's a bit unclear to me, including naming (what is extendedSupport and why is it realted
to state resetting?).

### Linked interactives

TODO
