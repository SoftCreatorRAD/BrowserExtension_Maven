chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log('RECEIVED MESSAGE: ' + msg);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://127.0.0.1/');
  xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
  xhr.send(msg);
});
