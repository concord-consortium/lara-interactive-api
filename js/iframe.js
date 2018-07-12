(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MockInteractive, iframePhone, l;

l = (require('./log')).instance();

iframePhone = require('iframe-phone');

module.exports = MockInteractive = (function() {
  MockInteractive.instances = {};

  MockInteractive.instance = function($iframe) {
    var base;
    if ((base = this.instances)[$iframe] == null) {
      base[$iframe] = new this($iframe);
    }
    return this.instances[$iframe];
  };

  MockInteractive.MessageResponses = {
    "getLearnerUrl": {
      "message": 'setLearnerUrl',
      "data": window.location.href
    },
    "getExtendedSupport": {
      "message": "extendedSupport",
      "data": {
        "opts": "none"
      }
    },
    "authInfo": false
  };

  MockInteractive.prototype.restartIframePhone = function($iframe) {
    var addHandler, logTheLogMessages, loggingChannel, message, ref, response;
    if (this.iframePhone) {
      this.iframePhone.disconnect();
      this.iframePhone = null;
    }
    this.iframePhone = new iframePhone.getIFrameEndpoint();
    addHandler = (function(_this) {
      return function(message, response) {
        return _this.iframePhone.addListener(message, function(data) {
          l.info("Phone call: " + message + ": " + (JSON.stringify(data)));
          if (response) {
            _this.iframePhone.post(response.message, response.data);
            return l.info("Phone responded: " + response.message + " - " + (JSON.stringify(response.data)));
          }
        });
      };
    })(this);
    ref = MockInteractive.MessageResponses;
    for (message in ref) {
      response = ref[message];
      addHandler(message, response);
    }
    this.iframePhone.addListener('loadInteractive', function(data) {
      l.info("Phone call: loadInteractive: " + (JSON.stringify(data)));
      return $('#interactiveState').val(JSON.stringify(data));
    });
    this.iframePhone.addListener('getInteractiveState', (function(_this) {
      return function(data) {
        l.info("Phone call: getInteractiveState");
        _this.iframePhone.post('interactiveState', JSON.parse($('#interactiveState').val()));
        return l.info("Phone responded: interactiveState");
      };
    })(this));
    this.iframePhone.addListener('loadInteractiveGlobal', function(data) {
      l.info("Phone call: interactiveStateGlobal: " + (JSON.stringify(data)));
      return $('#interactiveStateGlobal').val(JSON.stringify(data));
    });
    this.iframePhone.addListener('initInteractive', function(data) {
      l.info("Phone call: initInteractive: " + (JSON.stringify(data)));
      if (data.interactiveState) {
        $('#interactiveState').val(JSON.stringify(data.interactiveState));
      }
      if (data.authoredState) {
        $('#authoredState').val(this.convertIfNecessary(data.authoredState));
      }
      if (data.globalInteractiveState) {
        return $('#interactiveStateGlobal').val(JSON.stringify(data.globalInteractiveState));
      }
    });
    logTheLogMessages = function(message, callback) {
      if (message) {
        l.info("Logging RPC call: " + message.message);
      }
      return callback;
    };
    loggingChannel = new iframePhone.IframePhoneRpcEndpoint({
      handler: logTheLogMessages,
      namespace: 'lara-logging',
      targetWindow: window.parent,
      phone: this.iframePhone
    });
    this.iframePhone.initialize();
    l.info("Phone ready");
    return this.postAndLog("supportedFeatures", {
      apiVersion: 1,
      features: {
        authoredState: true,
        interactiveState: true
      }
    });
  };

  MockInteractive.prototype.postAndLog = function(msgType, data) {
    if (data == null) {
      data = null;
    }
    this.iframePhone.post(msgType, data);
    return l.info("posted " + msgType + ": " + (JSON.stringify(data)));
  };

  MockInteractive.prototype.convertIfNecessary = function(objectOrString) {
    if (typeof objectOrString === 'String') {
      return objectOrString;
    } else {
      return JSON.stringify(objectOrString);
    }
  };

  function MockInteractive() {
    l.info("Starting the dummy iframe interactive");
    this.restartIframePhone();
    $('#clear').click(function() {
      return $('#logger').html('');
    });
    $('#getAuthInfo').click((function(_this) {
      return function() {
        return _this.postAndLog('getAuthInfo');
      };
    })(this));
    $('#globalSaveState').click((function(_this) {
      return function() {
        return _this.postAndLog("interactiveStateGlobal", JSON.parse($('#interactiveStateGlobal').val()));
      };
    })(this));
    $('#saveAuthoredState').click((function(_this) {
      return function() {
        return _this.postAndLog("authoredState", JSON.parse($('#authoredState').val()));
      };
    })(this));
  }

  return MockInteractive;

})();

window.MockInteractive = MockInteractive;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3NjeXRhY2tpL0RldmVsb3BtZW50L2xhcmEtaW50ZXJhY3RpdmUtYXBpL3NyYy9jb2RlL2lmcmFtZS5jb2ZmZWUiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIvVXNlcnMvc2N5dGFja2kvRGV2ZWxvcG1lbnQvbGFyYS1pbnRlcmFjdGl2ZS1hcGkvc3JjL2NvZGUvaWZyYW1lLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBOztBQUFBLENBQUEsR0FBSSxDQUFDLE9BQUEsQ0FBUSxPQUFSLENBQUQsQ0FBaUIsQ0FBQyxRQUFsQixDQUFBOztBQUNKLFdBQUEsR0FBYyxPQUFBLENBQVEsY0FBUjs7QUFFZCxNQUFNLENBQUMsT0FBUCxHQUF1QjtFQUNyQixlQUFDLENBQUEsU0FBRCxHQUFhOztFQUNiLGVBQUMsQ0FBQSxRQUFELEdBQVcsU0FBQyxPQUFEO0FBQ1QsUUFBQTs7VUFBVyxDQUFBLE9BQUEsSUFBWSxJQUFJLElBQUosQ0FBTSxPQUFOOztXQUN2QixJQUFDLENBQUEsU0FBVSxDQUFBLE9BQUE7RUFGRjs7RUFJWCxlQUFDLENBQUEsZ0JBQUQsR0FDRTtJQUFBLGVBQUEsRUFDRTtNQUFBLFNBQUEsRUFBVyxlQUFYO01BQ0EsTUFBQSxFQUFRLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFEeEI7S0FERjtJQUlBLG9CQUFBLEVBQ0U7TUFBQSxTQUFBLEVBQVcsaUJBQVg7TUFDQSxNQUFBLEVBQ0U7UUFBQSxNQUFBLEVBQVEsTUFBUjtPQUZGO0tBTEY7SUFTQSxVQUFBLEVBQVksS0FUWjs7OzRCQVdGLGtCQUFBLEdBQW9CLFNBQUMsT0FBRDtBQUNsQixRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsV0FBSjtNQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxLQUZqQjs7SUFJQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUksV0FBVyxDQUFDLGlCQUFoQixDQUFBO0lBQ2Ys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

},{"./log":8,"iframe-phone":6}],2:[function(require,module,exports){
var structuredClone = require('./structured-clone');
var HELLO_INTERVAL_LENGTH = 200;
var HELLO_TIMEOUT_LENGTH = 60000;

function IFrameEndpoint() {
  var listeners = {};
  var isInitialized = false;
  var connected = false;
  var postMessageQueue = [];
  var helloInterval;

  function postToParent(message) {
    // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
    //     https://github.com/Modernizr/Modernizr/issues/388
    //     http://jsfiddle.net/ryanseddon/uZTgD/2/
    if (structuredClone.supported()) {
      window.parent.postMessage(message, '*');
    } else {
      window.parent.postMessage(JSON.stringify(message), '*');
    }
  }

  function post(type, content) {
    var message;
    // Message object can be constructed from 'type' and 'content' arguments or it can be passed
    // as the first argument.
    if (arguments.length === 1 && typeof type === 'object' && typeof type.type === 'string') {
      message = type;
    } else {
      message = {
        type: type,
        content: content
      };
    }
    if (connected) {
      postToParent(message);
    } else {
      postMessageQueue.push(message);
    }
  }

  function postHello() {
    postToParent({
      type: 'hello'
    });
  }

  function addListener(type, fn) {
    listeners[type] = fn;
  }

  function removeAllListeners() {
    listeners = {};
  }

  function getListenerNames() {
    return Object.keys(listeners);
  }

  function messageListener(message) {
    // Anyone can send us a message. Only pay attention to messages from parent.
    if (message.source !== window.parent) return;
    var messageData = message.data;
    if (typeof messageData === 'string') messageData = JSON.parse(messageData);

    if (!connected && messageData.type === 'hello') {
      connected = true;
      stopPostingHello();
      while (postMessageQueue.length > 0) {
        post(postMessageQueue.shift());
      }
    }

    if (connected && listeners[messageData.type]) {
      listeners[messageData.type](messageData.content);
    }
  }

  function disconnect() {
    connected = false;
    stopPostingHello();
    window.removeEventListener('message', messsageListener);
  }

  /**
    Initialize communication with the parent frame. This should not be called until the app's custom
    listeners are registered (via our 'addListener' public method) because, once we open the
    communication, the parent window may send any messages it may have queued. Messages for which
    we don't have handlers will be silently ignored.
  */
  function initialize() {
    if (isInitialized) {
      return;
    }
    isInitialized = true;
    if (window.parent === window) return;

    // We kick off communication with the parent window by sending a "hello" message. Then we wait
    // for a handshake (another "hello" message) from the parent window.
    startPostingHello();
    window.addEventListener('message', messageListener, false);
  }

  function startPostingHello() {
    if (helloInterval) {
      stopPostingHello();
    }
    helloInterval = window.setInterval(postHello, HELLO_INTERVAL_LENGTH);
    window.setTimeout(stopPostingHello, HELLO_TIMEOUT_LENGTH);
    // Post the first msg immediately.
    postHello();
  }

  function stopPostingHello() {
    window.clearInterval(helloInterval);
    helloInterval = null;
  }

  // Public API.
  return {
    initialize: initialize,
    getListenerNames: getListenerNames,
    addListener: addListener,
    removeAllListeners: removeAllListeners,
    disconnect: disconnect,
    post: post
  };
}

var instance = null;

// IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
module.exports = function getIFrameEndpoint() {
  if (!instance) {
    instance = new IFrameEndpoint();
  }
  return instance;
};

},{"./structured-clone":5}],3:[function(require,module,exports){
var ParentEndpoint = require('./parent-endpoint');
var getIFrameEndpoint = require('./iframe-endpoint');

// Not a real UUID as there's an RFC for that (needed for proper distributed computing).
// But in this fairly parochial situation, we just need to be fairly sure to avoid repeats.
function getPseudoUUID() {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var len = chars.length;
  var ret = [];

  for (var i = 0; i < 10; i++) {
    ret.push(chars[Math.floor(Math.random() * len)]);
  }
  return ret.join('');
}

module.exports = function IframePhoneRpcEndpoint(handler, namespace, targetWindow, targetOrigin, phone) {
  var pendingCallbacks = Object.create({});

  // if it's a non-null object, rather than a function, 'handler' is really an options object
  if (handler && typeof handler === 'object') {
    namespace = handler.namespace;
    targetWindow = handler.targetWindow;
    targetOrigin = handler.targetOrigin;
    phone = handler.phone;
    handler = handler.handler;
  }

  if (!phone) {
    if (targetWindow === window.parent) {
      phone = getIFrameEndpoint();
      phone.initialize();
    } else {
      phone = new ParentEndpoint(targetWindow, targetOrigin);
    }
  }

  phone.addListener(namespace, function (message) {
    var callbackObj;

    if (message.messageType === 'call' && typeof this.handler === 'function') {
      this.handler.call(undefined, message.value, function (returnValue) {
        phone.post(namespace, {
          messageType: 'returnValue',
          uuid: message.uuid,
          value: returnValue
        });
      });
    } else if (message.messageType === 'returnValue') {
      callbackObj = pendingCallbacks[message.uuid];

      if (callbackObj) {
        window.clearTimeout(callbackObj.timeout);
        if (callbackObj.callback) {
          callbackObj.callback.call(undefined, message.value);
        }
        pendingCallbacks[message.uuid] = null;
      }
    }
  }.bind(this));

  function call(message, callback) {
    var uuid = getPseudoUUID();

    pendingCallbacks[uuid] = {
      callback: callback,
      timeout: window.setTimeout(function () {
        if (callback) {
          callback(undefined, new Error("IframePhone timed out waiting for reply"));
        }
      }, 2000)
    };

    phone.post(namespace, {
      messageType: 'call',
      uuid: uuid,
      value: message
    });
  }

  function disconnect() {
    phone.disconnect();
  }

  this.handler = handler;
  this.call = call.bind(this);
  this.disconnect = disconnect.bind(this);
};

},{"./iframe-endpoint":2,"./parent-endpoint":4}],4:[function(require,module,exports){
var structuredClone = require('./structured-clone');

/**
  Call as:
    new ParentEndpoint(targetWindow, targetOrigin, afterConnectedCallback)
      targetWindow is a WindowProxy object. (Messages will be sent to it)

      targetOrigin is the origin of the targetWindow. (Messages will be restricted to this origin)

      afterConnectedCallback is an optional callback function to be called when the connection is
        established.

  OR (less secure):
    new ParentEndpoint(targetIframe, afterConnectedCallback)

      targetIframe is a DOM object (HTMLIframeElement); messages will be sent to its contentWindow.

      afterConnectedCallback is an optional callback function

    In this latter case, targetOrigin will be inferred from the value of the src attribute of the
    provided DOM object at the time of the constructor invocation. This is less secure because the
    iframe might have been navigated to an unexpected domain before constructor invocation.

  Note that it is important to specify the expected origin of the iframe's content to safeguard
  against sending messages to an unexpected domain. This might happen if our iframe is navigated to
  a third-party URL unexpectedly. Furthermore, having a reference to Window object (as in the first
  form of the constructor) does not protect against sending a message to the wrong domain. The
  window object is actualy a WindowProxy which transparently proxies the Window object of the
  underlying iframe, so that when the iframe is navigated, the "same" WindowProxy now references a
  completely differeent Window object, possibly controlled by a hostile domain.

  See http://www.esdiscuss.org/topic/a-dom-use-case-that-can-t-be-emulated-with-direct-proxies for
  more about this weird behavior of WindowProxies (the type returned by <iframe>.contentWindow).
*/

module.exports = function ParentEndpoint(targetWindowOrIframeEl, targetOrigin, afterConnectedCallback) {
  var postMessageQueue = [];
  var connected = false;
  var handlers = {};
  var targetWindowIsIframeElement;

  function getIframeOrigin(iframe) {
    return iframe.src.match(/(.*?\/\/.*?)\//)[1];
  }

  function post(type, content) {
    var message;
    // Message object can be constructed from 'type' and 'content' arguments or it can be passed
    // as the first argument.
    if (arguments.length === 1 && typeof type === 'object' && typeof type.type === 'string') {
      message = type;
    } else {
      message = {
        type: type,
        content: content
      };
    }
    if (connected) {
      var tWindow = getTargetWindow();
      // if we are laready connected ... send the message
      // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
      //     https://github.com/Modernizr/Modernizr/issues/388
      //     http://jsfiddle.net/ryanseddon/uZTgD/2/
      if (structuredClone.supported()) {
        tWindow.postMessage(message, targetOrigin);
      } else {
        tWindow.postMessage(JSON.stringify(message), targetOrigin);
      }
    } else {
      // else queue up the messages to send after connection complete.
      postMessageQueue.push(message);
    }
  }

  function addListener(messageName, func) {
    handlers[messageName] = func;
  }

  function removeListener(messageName) {
    handlers[messageName] = null;
  }

  // Note that this function can't be used when IFrame element hasn't been added to DOM yet
  // (.contentWindow would be null). At the moment risk is purely theoretical, as the parent endpoint
  // only listens for an incoming 'hello' message and the first time we call this function
  // is in #receiveMessage handler (so iframe had to be initialized before, as it could send 'hello').
  // It would become important when we decide to refactor the way how communication is initialized.
  function getTargetWindow() {
    if (targetWindowIsIframeElement) {
      var tWindow = targetWindowOrIframeEl.contentWindow;
      if (!tWindow) {
        throw "IFrame element needs to be added to DOM before communication " +
              "can be started (.contentWindow is not available)";
      }
      return tWindow;
    }
    return targetWindowOrIframeEl;
  }

  function receiveMessage(message) {
    var messageData;
    if (message.source === getTargetWindow() && (targetOrigin === '*' || message.origin === targetOrigin)) {
      messageData = message.data;
      if (typeof messageData === 'string') {
        messageData = JSON.parse(messageData);
      }
      if (handlers[messageData.type]) {
        handlers[messageData.type](messageData.content);
      } else {
        console.log("cant handle type: " + messageData.type);
      }
    }
  }

  function disconnect() {
    connected = false;
    window.removeEventListener('message', receiveMessage);
  }

  // handle the case that targetWindowOrIframeEl is actually an <iframe> rather than a Window(Proxy) object
  // Note that if it *is* a WindowProxy, this probe will throw a SecurityException, but in that case
  // we also don't need to do anything
  try {
    targetWindowIsIframeElement = targetWindowOrIframeEl.constructor === HTMLIFrameElement;
  } catch (e) {
    targetWindowIsIframeElement = false;
  }

  if (targetWindowIsIframeElement) {
    // Infer the origin ONLY if the user did not supply an explicit origin, i.e., if the second
    // argument is empty or is actually a callback (meaning it is supposed to be the
    // afterConnectionCallback)
    if (!targetOrigin || targetOrigin.constructor === Function) {
      afterConnectedCallback = targetOrigin;
      targetOrigin = getIframeOrigin(targetWindowOrIframeEl);
    }
  }

  // Handle pages served through file:// protocol. Behaviour varies in different browsers. Safari sets origin
  // to 'file://' and everything works fine, but Chrome and Safari set message.origin to null.
  // Also, https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage says:
  //  > Lastly, posting a message to a page at a file: URL currently requires that the targetOrigin argument be "*".
  //  > file:// cannot be used as a security restriction; this restriction may be modified in the future.
  // So, using '*' seems like the only possible solution.
  if (targetOrigin === 'file://') {
    targetOrigin = '*';
  }

  // when we receive 'hello':
  addListener('hello', function () {
    connected = true;

    // send hello response
    post({
      type: 'hello',
      // `origin` property isn't used by IframeEndpoint anymore (>= 1.2.0), but it's being sent to be
      // backward compatible with old IframeEndpoint versions (< v1.2.0).
      origin: window.location.href.match(/(.*?\/\/.*?)\//)[1]
    });

    // give the user a chance to do things now that we are connected
    // note that is will happen before any queued messages
    if (afterConnectedCallback && typeof afterConnectedCallback === "function") {
      afterConnectedCallback();
    }

    // Now send any messages that have been queued up ...
    while (postMessageQueue.length > 0) {
      post(postMessageQueue.shift());
    }
  });

  window.addEventListener('message', receiveMessage, false);

  // Public API.
  return {
    post: post,
    addListener: addListener,
    removeListener: removeListener,
    disconnect: disconnect,
    getTargetWindow: getTargetWindow,
    targetOrigin: targetOrigin
  };
};

},{"./structured-clone":5}],5:[function(require,module,exports){
var featureSupported = false;

(function () {
  var result = 0;

  if (!!window.postMessage) {
    try {
      // Safari 5.1 will sometimes throw an exception and sometimes won't, lolwut?
      // When it doesn't we capture the message event and check the
      // internal [[Class]] property of the message being passed through.
      // Safari will pass through DOM nodes as Null iOS safari on the other hand
      // passes it through as DOMWindow, gotcha.
      window.onmessage = function (e) {
        var type = Object.prototype.toString.call(e.data);
        result = (type.indexOf("Null") != -1 || type.indexOf("DOMWindow") != -1) ? 1 : 0;
        featureSupported = {
          'structuredClones': result
        };
      };
      // Spec states you can't transmit DOM nodes and it will throw an error
      // postMessage implimentations that support cloned data will throw.
      window.postMessage(document.createElement("a"), "*");
    } catch (e) {
      // BBOS6 throws but doesn't pass through the correct exception
      // so check error message
      result = (e.DATA_CLONE_ERR || e.message == "Cannot post cyclic structures.") ? 1 : 0;
      featureSupported = {
        'structuredClones': result
      };
    }
  }
}());

exports.supported = function supported() {
  return featureSupported && featureSupported.structuredClones > 0;
};

},{}],6:[function(require,module,exports){
module.exports = {
  /**
   * Allows to communicate with an iframe.
   */
  ParentEndpoint:  require('./lib/parent-endpoint'),
  /**
   * Allows to communicate with a parent page.
   * IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
   */
  getIFrameEndpoint: require('./lib/iframe-endpoint'),
  structuredClone: require('./lib/structured-clone'),

  // TODO: May be misnamed
  IframePhoneRpcEndpoint: require('./lib/iframe-phone-rpc-endpoint')

};

},{"./lib/iframe-endpoint":2,"./lib/iframe-phone-rpc-endpoint":3,"./lib/parent-endpoint":4,"./lib/structured-clone":5}],7:[function(require,module,exports){
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(this, function () {
    "use strict";

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType) return;

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          if (typeof window === undefinedType) return;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          // Fallback to cookies if local storage gives us nothing
          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location !== -1) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Top-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    return defaultLogger;
}));

},{}],8:[function(require,module,exports){
var Log, log;

log = require('loglevel');

Log = (function() {
  Log._instance = null;

  Log.instance = function() {
    if (this._instance == null) {
      this._instance = new this;
    }
    return this._instance;
  };

  function Log(logDiv, out, _in) {
    this.logDiv = logDiv != null ? logDiv : "#logger";
    this.out = out != null ? out : "#dataOut";
    this["in"] = _in != null ? _in : "#dataIn";
  }

  Log.prototype.writeCustomLogDom = function(message, severity) {
    var $log, $msg;
    if (severity == null) {
      severity = "warn";
    }
    $log = $(this.logDiv);
    if ($log && $log.length > 0) {
      $msg = $("<span class='" + severity + " logmsg'>" + message + "</span><br/>");
      $log.append($msg);
      return $log[0].scrollTop = $log[0].scrollHeight;
    }
  };

  Log.prototype.warn = function(m) {
    this.writeCustomLogDom(m, "warn");
    return log.warn(m);
  };

  Log.prototype.info = function(m) {
    this.writeCustomLogDom(m, "info");
    return log.info(m);
  };

  Log.prototype.error = function(m) {
    this.writeCustomLogDom(m, "error");
    return log.error(m);
  };

  Log.prototype.dataIn = function(message) {
    return $(this["in"].text)(message);
  };

  Log.prototype.dataOut = function(message) {
    return $(this.out.text)(message);
  };

  return Log;

})();

module.exports = Log;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3NjeXRhY2tpL0RldmVsb3BtZW50L2xhcmEtaW50ZXJhY3RpdmUtYXBpL3NyYy9jb2RlL2xvZy5jb2ZmZWUiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIvVXNlcnMvc2N5dGFja2kvRGV2ZWxvcG1lbnQvbGFyYS1pbnRlcmFjdGl2ZS1hcGkvc3JjL2NvZGUvbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBOztBQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsVUFBUjs7QUFFQTtFQUNKLEdBQUMsQ0FBQSxTQUFELEdBQWE7O0VBQ2IsR0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFBOztNQUNULElBQUMsQ0FBQSxZQUFhLElBQUk7O1dBQ2xCLElBQUMsQ0FBQTtFQUZROztFQUdFLGFBQUMsTUFBRCxFQUFvQixHQUFwQixFQUFxQyxHQUFyQztJQUFDLElBQUMsQ0FBQSwwQkFBRCxTQUFRO0lBQVcsSUFBQyxDQUFBLG9CQUFELE1BQUs7SUFBWSxJQUFDLEVBQUEsRUFBQSxtQkFBRCxNQUFJO0VBQXpDOztnQkFFYixpQkFBQSxHQUFtQixTQUFDLE9BQUQsRUFBUyxRQUFUO0FBRWpCLFFBQUE7O01BRjBCLFdBQVM7O0lBRW5DLElBQUEsR0FBTyxDQUFBLENBQUUsSUFBQyxDQUFBLE1BQUg7SUFDUCxJQUFHLElBQUEsSUFBUyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQTFCO01BQ0UsSUFBQSxHQUFPLENBQUEsQ0FBRSxlQUFBLEdBQWdCLFFBQWhCLEdBQXlCLFdBQXpCLEdBQW9DLE9BQXBDLEdBQTRDLGNBQTlDO01BQ1AsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaO2FBQ0EsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQVIsR0FBb0IsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLGFBSDlCOztFQUhpQjs7Z0JBUW5CLElBQUEsR0FBTSxTQUFDLENBQUQ7SUFDSixJQUFDLENBQUEsaUJBQUQsQ0FBbUIsQ0FBbkIsRUFBc0IsTUFBdEI7V0FDQSxHQUFHLENBQUMsSUFBSixDQUFTLENBQVQ7RUFGSTs7Z0JBSU4sSUFBQSxHQUFNLFNBQUMsQ0FBRDtJQUNKLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixDQUFuQixFQUFzQixNQUF0QjtXQUNBLEdBQUcsQ0FBQyxJQUFKLENBQVMsQ0FBVDtFQUZJOztnQkFJTixLQUFBLEdBQU8sU0FBQyxDQUFEO0lBQ0wsSUFBQyxDQUFBLGlCQUFELENBQW1CLENBQW5CLEVBQXNCLE9BQXRCO1dBQ0EsR0FBRyxDQUFDLEtBQUosQ0FBVSxDQUFWO0VBRks7O2dCQUlQLE1BQUEsR0FBUSxTQUFDLE9BQUQ7V0FDTixDQUFBLENBQUUsSUFBQyxFQUFBLEVBQUEsRUFBRSxDQUFDLElBQU4sQ0FBQSxDQUFZLE9BQVo7RUFETTs7Z0JBR1IsT0FBQSxHQUFTLFNBQUMsT0FBRDtXQUNQLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQVAsQ0FBQSxDQUFhLE9BQWI7RUFETzs7Ozs7O0FBR1gsTUFBTSxDQUFDLE9BQVAsR0FBaUIifQ==

},{"loglevel":7}]},{},[1]);
