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
// (...)
// IMPORTANT: Initialize connection after all message listeners are added!
phone.initialize();
```

### Handling the `initInteractive` message

This is one of the most important messages sent by LARA. It provides most of the information stored by LARA.
It tells the interactive what is the current API version, mode (`runtime` or `authoring`), `authoredState` (state defined by teacher), 
`interactiveState` (state based on student work) and so on. Interactive should add `initInteractive` handler that
reads values stored in `data` Object / hash:

```javascript
phone.addListener('initInteractive', function (data) {
  // process data object, e.g.:
  // initializeMode(data.mode);
  // loadAuthoredState(data.authoredState);
  // loadStudentWork(data.interactiveState);
});  
```

`data` consists of:

 - error - `null` if everything is okay, error message otherwise (e.g. data fetching might fail).
 - mode - `"authoring"` or `"runtime"`. Interactive can be displayed in one of those two modes, but it's up to interactive whether
 it supports authoring mode. Runtime is basic mode which is presented to students. Authoring mode can be used
 by authors to customize interactive.
 - **[optional]** authoredState - JSON that has been saved by interactive earlier in authoring mode using `authoredState` message (described
 below in other section). If it's not defined, it would be falsy value (null or empty string).
 - **[optional]** interactiveState - JSON that has been saved by interactive earlier in runtime mode using `interactiveState` message (described
 below in other section). Provided only in runtime mode. If it's not defined, it would be falsy value (null or empty string).
 - **[optional]** globalInteractiveState - JSON that has been saved by interactive earlier in runtime mode using `globalInteractiveState` message (described
 below in other section). Provided only in runtime mode. If it's not defined, it would be falsy value (null or empty string).
 - **[optional]** hasLinkedInteractive
 - **[optional]** linkedState
 - **[optional]** interactiveStateUrl
 - **[optional]** collaboratorUrls
 

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

`initInteractive` message provides `mode` property. Interactive can display authoring interface when mode value is equal
to `"authoring"`. Every customization made by author should be sent back to LARA using `authoredState` message:

```javascript
phone.post('authoredState', authoredState);  
```

There are no requirements regarding `authoredState` expect from the fact that it should be a JSON.
Next time the interactive is loaded either in authoring or runtime mode, `initInteractive` will provide this state to the interactive 
in `authoredState` property.
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

`initInteractive` provides `mode` property. `"runtime"` mode means that Interactive is viewed by student. Interactive
 can save student progress using `interactiveState` message:
 
 
```javascript
phone.post('interactiveState', interactiveState);  
```
 
 There are no requirements regarding `interactiveState` expect from the fact that it should be a JSON.
 Next time the interactive is loaded either in runtime mode, `initInteractive` will provide this state to the interactive
 in `interactiveState` property.