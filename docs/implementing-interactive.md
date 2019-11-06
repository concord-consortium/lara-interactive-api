# Implementing Interactive

LARA embeds interactives using iframe and provides LARA Interactive API. This API can be used e.g. to customize interactive,
save state authored by teachers or save student progress. The whole communication between LARA and Interactive
happens through [iFramePhone](https://github.com/concord-consortium/iframe-phone) which is a simple wrapper around
`postMessage` API. Interactive which wants to use LARA Interactive API needs to use this library. Check its
readme to see how to include it in your project (npm, RequireJS or via script tag). Once `iframePhone` library is
available, Interactive needs to setup communication:

## iframe-phone setup
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

## Handling the `initInteractive` message

This is one of the most important messages sent by LARA. It provides most of the information stored by LARA.
It tells the interactive what is the current API version, mode (`runtime`, `authoring` or `report`), `authoredState`
(state defined by author), `interactiveState` (state based on student work) and so on. Interactive should
add `initInteractive` handler that reads values stored in `data` Object / hash:

```javascript
phone.addListener('initInteractive', function (data) {
  // process data object, e.g.:
  initializeMode(data.mode);
  loadAuthoredState(data.authoredState);
  loadStudentWork(data.interactiveState);
});
```

### Data passed to initInteractive

 - **error** - `null` if everything is okay, error message otherwise (e.g. data fetching might fail).
 - **mode** - `"authoring"`, `"runtime"` or `"report"`. Interactive can be displayed in one of those three modes, but it's up to interactive whether it supports authoring mode. Runtime is basic mode which is presented to students. Authoring mode can be used by authors to customize interactive.  Report mode is used when embedding the interactive in a report.
 - **authoredState [optional]** - JSON that has been saved by interactive earlier in authoring mode using `authoredState` message (described below in other section). If it's not defined, it would be falsy value (null or empty string).
 - **interactiveState [optional]** - JSON that has been saved by interactive earlier in runtime mode using `interactiveState` message. More detail in [Saving Student Progress section](#saving-student-progress). Provided only in runtime mode. If it's not defined, it would be falsy value (null or empty string).
 - **globalInteractiveState [optional]** - JSON that has been saved by any interactive in the same activity earlier in runtime mode using [globalInteractiveState message](#global-interactive-state). Provided only in runtime mode. If it's not defined, it would be falsy value (null or empty string).
 - **hasLinkedInteractive [optional]** - boolean or undefined. If this is true then the author has linked this interactive to another interactive in the activity or sequence. This will be true even if the linked interactive has not saved state yet.
 - **linkedState [optional]** - JSON that has been saved by the linked interactive. If no state has been saved this will be falsy.
 - **interactiveStateUrl [optional]** - Fully qualified URL to access the interactive state externally. See [Accessing Interactive State with HTTP](#accessing-interactive-state-with-http) for more information.
 - **collaboratorUrls [optional]** - Fully qualified URL to access the interactive state of each collaborator working with the current student. These URLs can be used to save a copy of the work into each collaborator's interactive state.
 - **classInfoUrl** - URL to request more information about the class of the student that is running the interactive. When run as a student in the portal this URL is of form: `https://learn.staging.concord.org/api/v1/classes/[class_id]` it provides information about the teachers and students of the class. As well as a class_hash that can be used to store info about the class in a external system (like Firebase). The URL is protected by cookie based authentication. withCredentials should be used to access it. TODO: what happens when the activity is run without a class? For example when it is run anonymously.
 - **interactive** - The value of this is
```
   {id: [id of interactive in LARA], name: [name of interactive in LARA]}
```
 - **authInfo** - The value of this is
```
   {provider: [domain of authentication provider],
    loggedIn: [whether the current user is logged in],
    email:    [email address for the current user]}
```

## Interactive customization

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

`initInteractive` message provides `mode` property. Interactive can display authoring interface when mode value is equal to `"authoring"`. Every customization made by author should be sent back to LARA using `authoredState` message:

```javascript
phone.post('authoredState', data);
```

The authoredState data should be a JSON compatible object, that is the only requirement. Next time the interactive is loaded either in authoring or runtime mode, `initInteractive` will provide this state to the interactive in `authoredState` property. Note that it's recommended that `authoredState` should be sent to LARA immediately after every change. LARA provides its own "Save" button that would actually save this state to the DB and "Reset" which would set it back to null.

## Saving student progress

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

Normally the interactiveState data should be a JSON compatible object, that is the only requirement. Next time the interactive is loaded in runtime mode, `initInteractive` will provide this state to the interactive in `interactiveState` property.

LARA will send the interactive a `getInteractiveState` periodically:

- every 5 seconds
- on window focus
- iframe mouseout
- when the student tries to leave the page containing the interactive

The interactive should add a listener for `getInteractiveState`. To be safe, remember to add the listener before calling `phone.initialize();`. Here is an example listener:

```javascript
phone.addListener('getInteractiveState', function () {
  phone.post('interactiveState', interactiveState);
});
```

**IMPORTANT** When the student tries to leave the page with the interactive, the interactive needs to respond with an `interactiveState` message. LARA will not changes pages until it receives this message.

There is a special value `"nochange"`, that can be sent as the interactiveState data. This tells LARA the interactiveState has not changed since the last time. This is useful when responding to getInteractiveState

## Interactive aspectRatio

If interactive wants to tell LARA what aspect ratio use, it should inform LARA about it using `supportedFeatures` message:

```javascript
phone.post('supportedFeatures', {
  apiVersion: 1,
  features: {
    aspectRatio: 1.67
    // + other supported features
  }
});
```

The LARA author needs to select "Default aspect ratio, or set by interactive" in the interactive authoring dialog box, otherwise this setting will be ignored. More info about the interactive sizing can be found in the [LARA Authoring User Manual](https://docs.google.com/document/d/1d-06qDtpxi-l9eOc1wfYGZzY93Pww32IfZxBJaBXlWM/edit#heading=h.gh1cimnir3mk).

## Custom learner URL

**DEPRECATED** This feature is related to student progress saving. Interactive can provide versioned URL to make sure that the given data format is always supported. Otherwise the interactive might be updated and not be able to open the old state format.

This is deprecated because it causes more problems than it is worth. We have wanted to remove support for old versions of interactives, and we've had to remember to go through all of the interactive states and these learner urls.  Also the concept of saving a URL that works in this maner is confusing. Sometimes the interactive is loaded with the authored URL sometimes it is loaded with the saved URL. So a set of students or testers might see different versions of what seems like it should be the same interactive. Instead of using this approach to handle old state, the interactive should handle migrating its own old state. If migrating its own state isn't practical then please work with the LARA developers to do a batch migration on the server.

```javascript
phone.post('setLearnerUrl', 'https://my.example.interactive/version/1');
```

## Global interactive state

A few interactives can share one global state within a single LARA activity. E.g. you can let students work on the same model on different pages of the activity. Interactive can set global state using `interactiveStateGlobal` message:

```javascript
phone.post('interactiveStateGlobal', globalState);
```

Once this message is received, the server immediately posts `loadInteractiveGlobal` to all interactives on the same page (except from the sender of the original save message). So, interactives can listen to this message:

```javascript
phone.addListener('loadInteraciveGlobal', function (globalState) {
  // Process global state, e.g.:
  loadState(globalState);
});
```

If one of the interactives has sent `interactiveStateGlobal` message before another interactive is initialized then the global state will be provided in the `initInteractive` message.

**NOTE** Another way to communicate between two interactives is with
[Linked Interactives](#linked-interactives).

## Logging

This message proxies communication from the interactive → LARA → Logging server. There is only one way communication between the interactive and LARA. The interactive is expected to post following messages using iframe phone:

```javascript
phone.post('log', {action: 'actionName', data: {someValue: 1, otherValue: 2}});
```

LARA listens to these events only when logging is enabled (they will be ignored otherwise). When a `log` message is received, LARA issues a POST request to the Logging server. LARA uses provided action name and data, but also adds additional information to the event (context that might useful for researchers, e.g. user name, activity name, url, session ID, etc.).


## Auth info

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

The payload is the object `{provider: <string>, loggedIn: <boolean>, email: <string>}` where `provider` and `loggedIn` are always set and `email` is only set if the user has an email address.

## getExtendedSupport

This is a message sent by LARA to the interactive. The interactive can respond with a `extendedSupport` message. The data of the `extendedSupport` only supports one property `reset`. The value of reset should be boolean. If the interactive sends `reset: true` then LARA will show a button below the interactive for clearing the interactive state and reloading the interactive.  If `reset: false` then LARA will not show this button. By default LARA will show this button.

**NOTE** this extended support message is out of date. It is the only way to hide the reset button, so it isn't deprecated. New options like this will be added to the `supportedFeatures` message described above.


## Linked interactives

Each interactive in LARA can be linked with one other interactive in the same activity
or sequence. A LARA author edits the main interactive and can add a reference to the
linked interactive. Currently this reference is with an interactive id, but that
referencing mechanism could change and it should not effect how the interactives are
implemented.

When the main interactive is loaded it will be sent the `initInteractive` message just
like normal.  This message has 2 fields in related to linked interactives.

The `hasLinkedInteractive` field will be set to true if the author has setup the
linking.  This will be true even if the learner hasn't done any work on the linked
interactive yet.

The `linkedState` field will contain the work the learner has done on the linked
interactive. It will be falsy if the student hasn't done any work.

An example use case is an activity where a student is incrementally building a  diagram.
In interactive 1 the student fills out part of the diagram and then in interactive 2
the student is asked to add more to the diagram.  Interactive 2 can load in the state
from the interactive 1 and display the diagram the student created before. Any new
changes made can be saved separately into interactive 2's state.  The state of
interactive 1 will be preserved.

The main interactive can use the `hasLinkedInteractive` field to tell the difference
between being used independently in the activity or being linked to another
interactive.  In the diagram example above, if interactive 2 sees there is no
linkedState, it should then check `hasLinkedInteractive`.  In that case it could tell
the student "you should complete the previous diagram before starting this one". If
`hasLinkedInteractive` is falsy then the interactive knows it shouldn't show this
message.

## Accessing Interactive State with HTTP

TODO
