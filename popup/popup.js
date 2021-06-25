var isLogined = false;

let popupContent = document.querySelector('.popup-content');
let loginTemplate = document.querySelector('#login-template');
let mainTemplate = document.querySelector('#main-template');


document.addEventListener('mousedown', function (evt) {
  if (evt.target.classList.contains('link')) {
    chrome.tabs.create({url: evt.target.dataset.link, active: true});
    window.close();
  }
  if (evt.target.classList.contains('login-btn')) {
    isLogined = true;
    popupContent.innerHTML = '';
    popupContent.appendChild(mainTemplate.content.firstElementChild.cloneNode(true));
  }
});


if (isLogined) {
  popupContent.appendChild(mainTemplate.content.firstElementChild.cloneNode(true));
} else {
  popupContent.appendChild(loginTemplate.content.firstElementChild.cloneNode(true));
}
