# Shutterbug API

[Shutterbug](https://github.com/concord-consortium/shutterbug.js) is used widely in Lab and in LARA, it uses [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to request child iFrames HTML content for snapshotting.

The basic PostMessage API Calls that are used in the shutterbug javascript project are [documented in the github repo](https://github.com/concord-consortium/shutterbug.js/blob/master/app/scripts/shutterbug-worker.js#L276-L343)

##  Shutterbug Messages

### `htmlFragRequest`

Parent asks iframes about their content:

```javascript
 var message  = {
   type:        'htmlFragRequest',
   id:          id,       // Shutterbug ID
   iframeReqId: iframeId, // position of iframe in dom
   iframeReqTimeout: this.iframeReqTimeout * 0.6
 };
 window.postMessage(JSON.stringify(message), "*");
```

And an Iframe sends its content back:
```javascript
var response = {
  type:        'htmlFragResponse',
  value:       html,
  iframeReqId: iframeReqId, // counter, from request
  id:          id           // sender_id from request
};
source.postMessage(JSON.stringify(response), "*");
```
