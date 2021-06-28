let loadableTabs = [];


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.json) {

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1/');
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    xhr.send(msg.json);

    chrome.tabs.remove(sender.tab.id);

  } else if (msg.bigURL) {

    chrome.tabs.create({url: msg.bigURL, pinned: true, active: false}, function (tab) {
      loadableTabs.push(tab.id);
    });

  }
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (loadableTabs.indexOf(tabId) !== -1 && changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, {cmd: 'parseBigCard'});
    let loadableIndex = loadableTabs.indexOf(tabId);
    if (loadableIndex !== -1) {
      loadableTabs.splice(loadableIndex, 1);
    }
  }
});
