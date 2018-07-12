There is a mock interactive that developers can add to LARA to see how things work:
https://concord-consortium.github.io/lara-interactive-api/iframe.html

There is a page in which a interactive URL can be added and then the page lets the developer send messages to the interactive:
https://concord-consortium.github.io/lara-interactive-api/

These current tools could be much better.

Currently it shows a set of buttons for sending specific messages to the interactive. The data sent along with the can be set, and the result can be seen.

1. Not all messages are supported.
2. This doesn't explain how LARA is actually going to communicate with the interactive. A developer would need to look at the documentation to see how to construct the order the messages are being sent, and the data being sent with each message.
3. The set of messages is not complete.
4. There isn't a way to easily reload the interactive after a developer has changed it. If the developer is using live reload this wouldn't be a problem. But not all devs will be doing that.  The browser seems to cache the content in an iframe differently.


Ideas for improvements:
- split the tool into two parts: a generic iframe-phone message sender. This would let the dev send any message to the interactive and then see any responses. Some message names could be provided, but the dev should also be able to type in the messages. A second part would emulate what happens when the interactive is embedded in LARA. See below.
- add a reload button so it is easier to reload the interactive, this might take some testing on different browsers. It might not be possible to get the browser to clear the cache.
- The LARA tool, would need at least three modes: runtime, authoring, and reporting.  And it would also need a authoring UI that would let the dev set the same options an author can set in LARA: saves state, has_report_url, ...  Then the dev would need to able to see and change the runtime state, the authoring state, and the linked state.  There should be some log of what is happening so when multiple messages go by the dev can see the data of each. And ideally there would be a step, play, pause control. So the dev could step through the series of messages LARA sends to the interactive. In runtime mode there would need to be a button that would simulate the 'next' button in LARA. This button requires a save state interactive to return some state before moving on. And it would also be an indication of the interactive allowing LARA to move on, if the interactive is blocking forward navigation.
- it would be useful to have a test iframe that would show the messages lara is sending to it. I'm pretty sure we had this already somewhere...
