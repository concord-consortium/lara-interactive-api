(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var GlobalIframeSaver, iframePhone, l;

l = require('loglevel');

iframePhone = require('iframe-phone');

module.exports = GlobalIframeSaver = (function() {
  var INTERACTIVES_SEL;

  INTERACTIVES_SEL = 'iframe.interactive';

  function GlobalIframeSaver(config) {
    this._globalState = config.raw_data ? JSON.parse(config.raw_data) : null;
    this._iframePhones = [];
    $(INTERACTIVES_SEL).each((function(_this) {
      return function(idx, iframeEl) {
        var phone;
        return phone = new iframePhone.ParentEndpoint($(iframeEl)[0], function() {
          return _this.addNewPhone(phone);
        });
      };
    })(this));
  }

  GlobalIframeSaver.prototype.addNewPhone = function(phone) {
    this._iframePhones.push(phone);
    this._setupPhoneListeners(phone);
    if (this._globalState) {
      return this._loadGlobalState(phone);
    }
  };

  GlobalIframeSaver.prototype._setupPhoneListeners = function(phone) {
    return phone.addListener('interactiveStateGlobal', (function(_this) {
      return function(state) {
        _this._globalState = state;
        return _this._broadcastGlobalState(phone);
      };
    })(this));
  };

  GlobalIframeSaver.prototype._loadGlobalState = function(phone) {
    return phone.post('loadInteractiveGlobal', this._globalState);
  };

  GlobalIframeSaver.prototype._broadcastGlobalState = function(sender) {
    return this._iframePhones.forEach((function(_this) {
      return function(phone) {
        if (phone !== sender) {
          return _this._loadGlobalState(phone);
        }
      };
    })(this));
  };

  return GlobalIframeSaver;

})();

window.GlobalIframeSaver = GlobalIframeSaver;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL1VzZXJzL3BqYW5pay9Db25jb3JkL2xhcmEtaW50ZXJhY3RpdmUtYXBpL3NyYy9jb2RlL2dsb2JhbC1zYXZlci5jb2ZmZWUiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIvVXNlcnMvcGphbmlrL0NvbmNvcmQvbGFyYS1pbnRlcmFjdGl2ZS1hcGkvc3JjL2NvZGUvZ2xvYmFsLXNhdmVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxJQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsVUFBUjs7QUFDSixXQUFBLEdBQWMsT0FBQSxDQUFRLGNBQVI7O0FBRWQsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsTUFBQTs7RUFBQSxnQkFBQSxHQUFtQjs7RUFFTiwyQkFBQyxNQUFEO0lBQ1gsSUFBQyxDQUFBLFlBQUQsR0FBbUIsTUFBTSxDQUFDLFFBQVYsR0FBd0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsUUFBbEIsQ0FBeEIsR0FBeUQ7SUFFekUsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEdBQUQsRUFBTSxRQUFOO0FBQ3ZCLFlBQUE7ZUFBQSxLQUFBLEdBQVEsSUFBSSxXQUFXLENBQUMsY0FBaEIsQ0FBK0IsQ0FBQSxDQUFFLFFBQUYsQ0FBWSxDQUFBLENBQUEsQ0FBM0MsRUFBK0MsU0FBQTtpQkFDckQsS0FBQyxDQUFBLFdBQUQsQ0FBYSxLQUFiO1FBRHFELENBQS9DO01BRGU7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0VBSlc7OzhCQVFiLFdBQUEsR0FBYSxTQUFDLEtBQUQ7SUFDWCxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsS0FBcEI7SUFDQSxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsS0FBdEI7SUFDQSxJQUFHLElBQUMsQ0FBQSxZQUFKO2FBQ0UsSUFBQyxDQUFBLGdCQUFELENBQWtCLEtBQWxCLEVBREY7O0VBSFc7OzhCQU1iLG9CQUFBLEdBQXNCLFNBQUMsS0FBRDtXQUNwQixLQUFLLENBQUMsV0FBTixDQUFrQix3QkFBbEIsRUFBNEMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEtBQUQ7UUFDMUMsS0FBQyxDQUFBLFlBQUQsR0FBZ0I7ZUFDaEIsS0FBQyxDQUFBLHFCQUFELENBQXVCLEtBQXZCO01BRjBDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QztFQURvQjs7OEJBS3RCLGdCQUFBLEdBQWtCLFNBQUMsS0FBRDtXQUNoQixLQUFLLENBQUMsSUFBTixDQUFXLHVCQUFYLEVBQW9DLElBQUMsQ0FBQSxZQUFyQztFQURnQjs7OEJBR2xCLHFCQUFBLEdBQXVCLFNBQUMsTUFBRDtXQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBdUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEtBQUQ7UUFFckIsSUFBMkIsS0FBQSxLQUFXLE1BQXRDO2lCQUFBLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixLQUFsQixFQUFBOztNQUZxQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7RUFEcUI7Ozs7OztBQUt6QixNQUFNLENBQUMsaUJBQVAsR0FBMkIifQ==

},{"iframe-phone":6,"loglevel":7}],2:[function(require,module,exports){
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

  function removeListener(type) {
    delete listeners[type];
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
    removeAllListeners();
    window.removeEventListener('message', messageListener);
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
    removeListener: removeListener,
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
    delete handlers[messageName];
  }

  function removeAllListeners() {
    handlers = {};
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
    removeAllListeners();
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
    removeAllListeners: removeAllListeners,
    disconnect: disconnect,
    getTargetWindow: getTargetWindow,
    targetOrigin: targetOrigin
  };
};

},{"./structured-clone":5}],5:[function(require,module,exports){
var featureSupported = {
  'structuredClones': 0
};

(function () {
  var result = 0;

  if (!!window.postMessage) {
    try {
      // Spec states you can't transmit DOM nodes and it will throw an error
      // postMessage implementations that support cloned data will throw.
      window.postMessage(document.createElement("a"), "*");
    } catch (e) {
      // BBOS6 throws but doesn't pass through the correct exception
      // so check error message
      result = (e.DATA_CLONE_ERR || e.message === "Cannot post cyclic structures.") ? 1 : 0;
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
    var isIE = (typeof window !== undefinedType) && (typeof window.navigator !== undefinedType) && (
        /Trident\/|MSIE /.test(window.navigator.userAgent)
    );

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

    // Trace() doesn't print the message in IE, so for that case we need to wrap it
    function traceForIE() {
        if (console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                // In old IE, native console methods themselves don't have apply().
                Function.prototype.apply.apply(console.log, [console, arguments]);
            }
        }
        if (console.trace) console.trace();
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (methodName === 'trace' && isIE) {
            return traceForIE;
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
      defaultLevel = defaultLevel == null ? "WARN" : defaultLevel;

      var storageKey = "loglevel";
      if (typeof name === "string") {
        storageKey += ":" + name;
      } else if (typeof name === "symbol") {
        storageKey = undefined;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType || !storageKey) return;

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

          if (typeof window === undefinedType || !storageKey) return;

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

      function clearPersistedLevel() {
          if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
              window.localStorage.removeItem(storageKey);
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          } catch (ignore) {}
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
          defaultLevel = level;
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.resetLevel = function () {
          self.setLevel(defaultLevel, false);
          clearPersistedLevel();
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
          initialLevel = defaultLevel;
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
        if ((typeof name !== "symbol" && typeof name !== "string") || name === "") {
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

    // ES6 default export, for compatibility
    defaultLogger['default'] = defaultLogger;

    return defaultLogger;
}));

},{}]},{},[1]);
