# Using iFramePhone

As mentioned [iFramePhone](https://github.com/concord-consortium/iframe-phone) is the service which LARA uses for much of its iFrame communication.   It is also used by Lab Interactives internally. Most of the Lab messages are ignored by LARA.

Here for reference is what the implementation looks like. Taken from the [iFramePhone Readme](https://github.com/concord-consortium/iframe-phone):

#### Parent Setup
```javascript
var phone = new iframePhone.ParentEndpoint(iframeElement, function () {
  console.log("connection with iframe established");
});
phone.post('testMessage', 'abc');
phone.addListener('response', function (content) {
  console.log("parent received response: " + content);
});
```

#### Iframe (child) Setup
```javascript
var phone = iframePhone.getIFrameEndpoint();
phone.addListener('testMessage', function (content) {
  console.log("iframe received message: " + content);
  phone.post('response', 'got it');
});
// IMPORTANT:
// Initialize connection after all message listeners are added!
phone.initialize();
```

#### Hello Messages
iFramePhone uses a `hello` messages to start communication with a specified origin. These messages get sent using the PostMessage API and look like this:

```javascript
var message = {
  type: "hello",
  origin: "https://lab.concord.org"
};
```

#### Other Messages
Subsequent messages follow a similar pattern, specifiying `type` which helps determine which listeners to notify:

```javascript
var message = {
  type:"modelLoaded",
  …
};
```

#### Message Posting Implementation
The post messages looks like this as they are being sent out through iFramePhone. You don't need to worry about this; it is here for reference.

```javascript
message = {
  type: "getLearnerUrl",
  origin: "http://localhost:3000",
  content: {} // something specific to 'type'
};
Window.postMessage(JSON.stringify(message), targetOrigin);
```
