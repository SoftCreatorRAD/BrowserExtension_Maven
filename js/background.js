let loadableTabs = [];


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  let tabId = sender.tab.id;
  let loadableIndex = loadableTabs.indexOf(tabId);

  if (msg.checkIsAutoClosing && loadableIndex !== -1) {

    sendResponse({isAutoClosingTab: true});

  } else if (msg.json) {

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1/');
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    xhr.send(msg.json);

    if (loadableIndex !== -1) {
      loadableTabs.splice(loadableIndex, 1);
      chrome.tabs.remove(tabId);
    }

  } else if (msg.bigCardUrl) {

    let isActive = msg.isRealtor || msg.isTrulia ? true : false;
    chrome.tabs.create({url: msg.bigCardUrl, pinned: true, active: isActive}, function (tab) {
      loadableTabs.push(tab.id);
    });

  }
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (loadableTabs.indexOf(tabId) !== -1 && changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, {cmd: 'parseBigCard'});
  }
});
