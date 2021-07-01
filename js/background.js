let loadableTabs = [];
let prevActiveTab = null;

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  let tabId = sender.tab.id;
  let loadableIndex = loadableTabs.indexOf(tabId);

  if (msg.activateTab) {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var currTab = tabs[0];
      if (currTab && loadableTabs.indexOf(currTab.id) === -1) {
        prevActiveTab = currTab.id;
      }
    });
    chrome.tabs.update(tabId, {active: true});
    sendResponse({ok: true});

  } else if (msg.checkIsAutoClosing && loadableIndex !== -1) {

    chrome.tabs.update(prevActiveTab, {active: true});
    sendResponse({isAutoClosingTab: true});

  } else if (msg.json) {

    console.log(JSON.stringify(JSON.parse(msg.json), null, '  '));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1/');
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    xhr.send(msg.json);

    if (loadableIndex !== -1) {
      loadableTabs.splice(loadableIndex, 1);
      chrome.tabs.remove(tabId);
    }

  } else if (msg.bigCardUrl) {

    prevActiveTab = tabId;
    chrome.tabs.create({url: msg.bigCardUrl, pinned: true, active: false}, function (tab) {
      loadableTabs.push(tab.id);
      chrome.tabs.insertCSS(tab.id, {code: 'body {opacity:0 !important}'});
    });

  }
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (loadableTabs.indexOf(tabId) !== -1 && changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, {cmd: 'parseBigCard'});
  }
});
