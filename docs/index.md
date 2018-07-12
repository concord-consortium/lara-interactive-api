# LARA Interactive API

Table of contents:

[TOC]

## Startup and Initialization

LARA interactive iframes communicate to LARA via a postMessage API. LARA uses our [iFramePhone](https://github.com/concord-consortium/iframe-phone) library to communicate with the iframe. An interactive can use iFramePhone or it can implement raw postMessage calls.  This document assumes the interactive is using iFramePhone.

The interactive should first setup a iFramePhone endpoint. And then add listeners to it.

The first message the interactive will be initInteractive.

## Messages sent to interactive

### getExtendedSupport

Sent to the intearctive at startup to find out the `extendedSupport` status. This is the first message the interactive will receive. It has no payload data.

### initInteractive

First message sent to the interactive after the iFramePhone channel has been initialized. This message will be sent even if the interactive has not saved any interactive state. Currently this message will only be sent if the LARA author has checked the 'save state' box for the interactive.

The payload is the object:

    version: 1,
    error: <string>,
    interactiveState: <object>,
    hasLinkedInteractive: <boolean>,
    linkedState: <object>

 The `error` member will be a string denoting any error LARA recieved while trying to look up the interactive state for this interactive. The `interactiveState` member will be null if there is no current state or will otherwise be the same object returned by `loadInteractive`.  The `hasLinkedInteractive` member will be true if the interactive is linked to another interactive in the authoring system and the `linkedState` will be the current interactive state of that linked interactive.

### authInfo

Sent by LARA only in response to a `getAuthInfo` request from the interactive. by the client.  The payload is:

    provider: <string>,
    loggedIn: <boolean>,
    email: <string>

where `provider` and `loggedIn` are always set and `email` is only set if
the user has an email address.

### getInteractiveState

Sent to the interactive every 5 seconds to query the interactive about its saved state. It has no payload data.

### loadInteractiveGlobal

Sent to the interactive, either during initialzation time or when another interactive on the page saves global state. The payload for the message is an arbitrary serialized object.  It's the interactive's responsibility to interpret this message and load (or not) the given state.

This message is sent when:

- The `interactiveStateGlobal` message is received by the server
- The activity page is loaded **and** the global interactive state is available in LARA activity run (so only if `interactiveStateGlobal` has been received earlier)

 ## Messages interactive can send

