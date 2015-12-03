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
          l.info("Phone call: " + message + ": " + data);
          if (response) {
            _this.iframePhone.post(response.message, response.data);
            return l.info("Phone responded: " + response.message + " - " + response.data);
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
      l.info("Phone call: loadInteractive: " + data);
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
      l.info("Phone call: interactiveStateGlobal: " + data);
      return $('#interactiveStateGlobal').val(JSON.stringify(data));
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
    return l.info("Phone ready");
  };

  function MockInteractive() {
    l.info("Starting the dummy iframe interactive");
    this.restartIframePhone();
    $('#clear').click(function() {
      return $('#logger').html('');
    });
    $('#getAuthInfo').click((function(_this) {
      return function() {
        l.info('posting getAuthInfo');
        return _this.iframePhone.post("getAuthInfo");
      };
    })(this));
    $('#globalSaveState').click((function(_this) {
      return function() {
        l.info('posting interactiveStateGlobal');
        return _this.iframePhone.post("interactiveStateGlobal", JSON.parse($('#interactiveStateGlobal').val()));
      };
    })(this));
  }

  return MockInteractive;

})();

window.MockInteractive = MockInteractive;



},{"./log":8,"iframe-phone":6}],2:[function(require,module,exports){
var structuredClone = require('./structured-clone');
var HELLO_INTERVAL_LENGTH = 200;
var HELLO_TIMEOUT_LENGTH = 60000;

function IFrameEndpoint() {
  var parentOrigin;
  var listeners = {};
  var isInitialized = false;
  var connected = false;
  var postMessageQueue = [];
  var helloInterval;

  function postToTarget(message, target) {
    // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
    //     https://github.com/Modernizr/Modernizr/issues/388
    //     http://jsfiddle.net/ryanseddon/uZTgD/2/
    if (structuredClone.supported()) {
      window.parent.postMessage(message, target);
    } else {
      window.parent.postMessage(JSON.stringify(message), target);
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
      postToTarget(message, parentOrigin);
    } else {
      postMessageQueue.push(message);
    }
  }

  // Only the initial 'hello' message goes permissively to a '*' target (because due to cross origin
  // restrictions we can't find out our parent's origin until they voluntarily send us a message
  // with it.)
  function postHello() {
    postToTarget({
      type: 'hello',
      origin: document.location.href.match(/(.*?\/\/.*?)\//)[1]
    }, '*');
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

      // We don't know origin property of parent window until it tells us.
      if (!connected && messageData.type === 'hello') {
        // This is the return handshake from the embedding window.
        parentOrigin = messageData.origin;
        connected = true;
        stopPostingHello();
        while(postMessageQueue.length > 0) {
          post(postMessageQueue.shift());
        }
      }

      // Perhaps-redundantly insist on checking origin as well as source window of message.
      if (message.origin === parentOrigin) {
        if (listeners[messageData.type]) listeners[messageData.type](messageData.content);
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
    postHello();
    startPostingHello();
    window.addEventListener('message', messageListener, false);
  }

  function startPostingHello() {
    if (helloInterval) {
      stopPostingHello();
    }
    helloInterval = window.setInterval(postHello, HELLO_INTERVAL_LENGTH);
    window.setTimeout(stopPostingHello, HELLO_TIMEOUT_LENGTH);
  }

  function stopPostingHello() {
    window.clearInterval(helloInterval);
    helloInterval = null;
  }

  // Public API.
  return {
    initialize        : initialize,
    getListenerNames  : getListenerNames,
    addListener       : addListener,
    removeAllListeners: removeAllListeners,
    disconnect        : disconnect,
    post              : post
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
"use strict";

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

    if ( ! phone ) {
        if (targetWindow === window.parent) {
            phone = getIFrameEndpoint();
            phone.initialize();
        } else {
            phone = new ParentEndpoint(targetWindow, targetOrigin);
        }
    }

    phone.addListener(namespace, function(message) {
        var callbackObj;

        if (message.messageType === 'call' && typeof this.handler === 'function') {
            this.handler.call(undefined, message.value, function(returnValue) {
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
            timeout: window.setTimeout(function() {
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
  var selfOrigin = window.location.href.match(/(.*?\/\/.*?)\//)[1];
  var postMessageQueue = [];
  var connected = false;
  var handlers = {};
  var targetWindowIsIframeElement;

  function getOrigin(iframe) {
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
      message.origin = selfOrigin;
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
    if (message.source === getTargetWindow() && message.origin === targetOrigin) {
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
      targetOrigin = getOrigin(targetWindowOrIframeEl);
    }
  }

  // when we receive 'hello':
  addListener('hello', function() {
    connected = true;

    // send hello response
    post('hello');

    // give the user a chance to do things now that we are connected
    // note that is will happen before any queued messages
    if (afterConnectedCallback && typeof afterConnectedCallback === "function") {
      afterConnectedCallback();
    }

    // Now send any messages that have been queued up ...
    while(postMessageQueue.length > 0) {
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
      window.onmessage = function(e){
        var type = Object.prototype.toString.call(e.data);
        result = (type.indexOf("Null") != -1 || type.indexOf("DOMWindow") != -1) ? 1 : 0;
        featureSupported = {
          'structuredClones': result
        };
      };
      // Spec states you can't transmit DOM nodes and it will throw an error
      // postMessage implimentations that support cloned data will throw.
      window.postMessage(document.createElement("a"),"*");
    } catch(e) {
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
    if (typeof module === 'object' && module.exports && typeof require === 'function') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        root.log = definition();
    }
}(this, function () {
    var self = {};
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

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

    function enableLoggingWhenConsoleArrives(methodName, level) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods(level);
                self[methodName].apply(self, arguments);
            }
        };
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function replaceLoggingMethods(level) {
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            self[methodName] = (i < level) ? noop : self.methodFactory(methodName, level);
        }
    }

    function persistLevelIfPossible(levelNum) {
        var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

        // Use localStorage if available
        try {
            window.localStorage['loglevel'] = levelName;
            return;
        } catch (ignore) {}

        // Use session cookie as fallback
        try {
            window.document.cookie = "loglevel=" + levelName + ";";
        } catch (ignore) {}
    }

    function loadPersistedLevel() {
        var storedLevel;

        try {
            storedLevel = window.localStorage['loglevel'];
        } catch (ignore) {}

        if (typeof storedLevel === undefinedType) {
            try {
                storedLevel = /loglevel=([^;]+)/.exec(window.document.cookie)[1];
            } catch (ignore) {}
        }
        
        if (self.levels[storedLevel] === undefined) {
            storedLevel = "WARN";
        }

        self.setLevel(self.levels[storedLevel]);
    }

    /*
     *
     * Public API
     *
     */

    self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
        "ERROR": 4, "SILENT": 5};

    self.methodFactory = function (methodName, level) {
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives(methodName, level);
    };

    self.setLevel = function (level) {
        if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
            level = self.levels[level.toUpperCase()];
        }
        if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
            persistLevelIfPossible(level);
            replaceLoggingMethods(level);
            if (typeof console === undefinedType && level < self.levels.SILENT) {
                return "No console available for logging";
            }
        } else {
            throw "log.setLevel() called with invalid level: " + level;
        }
    };

    self.enableAll = function() {
        self.setLevel(self.levels.TRACE);
    };

    self.disableAll = function() {
        self.setLevel(self.levels.SILENT);
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    self.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === self) {
            window.log = _log;
        }

        return self;
    };

    loadPersistedLevel();
    return self;
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



},{"loglevel":7}]},{},[1]);
