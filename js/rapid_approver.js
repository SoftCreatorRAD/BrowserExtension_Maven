const domain = window.location.hostname.split('.').reverse()[1];

const cardSel = {
  trulia: '[data-testid="home-card-sale"]',
  truliaBig: '[data-testid="home-details-summary-container"]',
  zillow: 'article.list-card',
  zillowBig: '#home-detail-lightbox-container',
  redfin: '.HomeCard .v2',
  redfinBig: '.aboveBelowTheRail',
  realtor: '[data-testid="property-list-container"] [data-testid="property-card"]',
  realtorBig: '[data-testid="listing-details-id"]',
}

const priceSel = {
  trulia: '[data-testid="property-price"]',
  truliaBig: '[data-testid="home-details-sm-lg-xl-price-details"]>h3',
  zillow: '.list-card-price',
  zillowBig: '.ds-home-details-chip .ds-summary-row > span:first-child, .ds-chip div[class*="Flex-"]>div[class*="Flex-"]:first-child>*',
  redfin: '.homecardV2Price',
  redfinBig: '.price-section',
  realtor: '[data-label="pc-price"]',
  realtorBig: '[data-testid="list-price"]',
}


// Preloaders for trulia and realtor:
window.addEventListener('load', function () {
  if (domain === 'trulia') {
    setTimeout(() => {
      chrome.runtime.sendMessage({activateTab: true}, function (response) {
        preloadPaymentDataTrulia();
      });
    }, 0);
  } else if (domain === 'realtor') {
    setTimeout(() => {
      chrome.runtime.sendMessage({activateTab: true}, function (response) {
        preloadPaymentDataRealtor();
      });
    }, 100);
  }
});



let preloadPaymentDataTrulia = function () {
  let preloadContainer = document.querySelector('[data-testid="affordability-placeholder"]');
  if (preloadContainer) {
    let offset = {
      x: window.pageXOffset,
      y: window.pageYOffset
    }
    preloadContainer.scrollIntoView(true);
    setTimeout(function () {
      window.scrollTo(offset.x, offset.y);
      chrome.runtime.sendMessage({checkIsAutoClosing: true}, function (response) {
        if (response.isAutoClosingTab) {
          setTimeout(() => {
            document.querySelector('a.rapidapprover-btn').click();
          }, 700);
        }
      });
    }, 20);
  }
}


let preloadPaymentDataRealtor = function () {
  let offset = {
    x: window.pageXOffset,
    y: window.pageYOffset
  }
  let btn = document.querySelector('[data-label="Monthly Payment"]>[data-testid="section-toggle"]');
  let btn2 = document.querySelector('[data-label="Property History"]');
  let btn3 = document.querySelector('[data-label="Property Details"]');
  let btn4 = document.querySelector('[data-label="Open Houses"]');
  let btnToScroll = btn || btn2 || btn3 || btn4;
  if (btnToScroll) {
    btnToScroll.scrollIntoView(true);
    setTimeout(() => {
      let btnToClick = document.querySelector('[data-label="Monthly Payment"]>[data-testid="section-toggle"]');
      if (btnToClick) {
        btnToClick.click();
        setTimeout(() => {
          window.scrollTo(offset.x, offset.y);
          chrome.runtime.sendMessage({checkIsAutoClosing: true}, function (response) {
            if (response.isAutoClosingTab) {
              setTimeout(() => {
                document.querySelector('a.rapidapprover-btn').click();
              }, 1000);
            }
          });
        }, 100);
      }
    }, 200);
  }
}



chrome.runtime.onMessage.addListener(function (msg) {
  if (msg.cmd === 'parseBigCard') {
    if (domain === 'redfin' || domain === 'zillow') {
      setTimeout(() => {
        document.querySelector('a.rapidapprover-btn').click();
      }, 200);
    }
  }
});



document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('click', function (evt) {
    let btn = evt.target;
    if (btn && btn.classList && btn.classList.contains('rapidapprover-btn')) {
      let isBigCard = btn.classList.contains('rapidapprover-' + domain + '-big') ? true : false;

      if (isBigCard) {

        let dataObj = getParsed(btn, cardSel, priceSel, domain);
        let json = JSON.stringify(dataObj);
        //alert(JSON.stringify(dataObj, null, '  '));
        chrome.runtime.sendMessage({json: json});
        console.log(JSON.stringify(dataObj, null, '  '));

      } else if (domain === 'redfin') {

        let bigCardUrl = btn.closest(cardSel[domain]).querySelector('.bottomV2>a').href;
        if (bigCardUrl) {
          chrome.runtime.sendMessage({bigCardUrl: bigCardUrl});
        }

      } else if (domain === 'zillow') {

        let bigCardUrl = btn.closest(cardSel[domain]).querySelector('a.list-card-link').href;
        if (bigCardUrl) {
          chrome.runtime.sendMessage({bigCardUrl: bigCardUrl});
        }

      } else if (domain === 'realtor') {

        let bigCardUrl = btn.closest(cardSel[domain]).querySelector('a[data-testid="property-anchor"]').href;
        if (bigCardUrl) {
          chrome.runtime.sendMessage({bigCardUrl: bigCardUrl, isRealtor: true});
        }

      } else if (domain === 'trulia') {

        let bigCardUrl = btn.closest(cardSel[domain]).querySelector('a[data-testid="property-card-link"]').href;
        if (bigCardUrl) {
          chrome.runtime.sendMessage({bigCardUrl: bigCardUrl, isTrulia: true});
        }

      }
    }
  });



  if (domain === 'zillow') {
    let propertiesParent = document.getElementById('grid-search-results');
    if (propertiesParent === null) {
      return;
    }
    for (let card of propertiesParent.querySelectorAll(cardSel.zillow)) {
      rapidapproverCreateBtn('zillow', card, priceSel.zillow, 'zillow-main');
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.zillow)) {
              rapidapproverCreateBtn('zillow', card, priceSel.zillow, 'zillow-main');
            }
            if (node.querySelector(priceSel.zillow)) {
              rapidapproverCreateBtn('zillow', node.closest(cardSel.zillow), priceSel.zillow, 'zillow-main');
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(propertiesParent, {attributes: false, childList: true, subtree: true});
    // Big card:
    let detailsPopup = document.querySelector(cardSel.zillowBig);
    let detailsMutationCallback = function (mutations) {
      if (mutations[0].addedNodes.length > 0) {
        rapidapproverCreateBtn('zillow', detailsPopup, priceSel.zillowBig, 'zillow-big');
      }
    };
    let detailsObserver = new MutationObserver(detailsMutationCallback);
    detailsObserver.observe(detailsPopup, {attributes: false, childList: true, subtree: true});
  }



  else if (domain === 'trulia') {
    for (let card of document.querySelectorAll(cardSel.trulia)) {
      rapidapproverCreateBtn('trulia', card, priceSel.trulia, 'trulia-main');
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains('rapidapprover-btn')) {
            mutation.target.appendChild(node);
          }
        }
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.trulia)) {
              rapidapproverCreateBtn('trulia', card, priceSel.trulia, 'trulia-main');
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, {attributes: false, childList: true, subtree: true});
    // Big card:
    let standalonePage = document.querySelector(cardSel.truliaBig);
    if (standalonePage !== null) {
      rapidapproverCreateBtn('trulia', standalonePage, priceSel.truliaBig, 'trulia-big');
    }
  }



  else if (domain === 'redfin') {
    for (let card of document.querySelectorAll(cardSel.redfin)) {
      rapidapproverCreateBtn('redfin', card, priceSel.redfin, 'redfin-main');
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains('rapidapprover-btn')) {
            mutation.target.appendChild(node);
          }
        }
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.redfin)) {
              rapidapproverCreateBtn('redfin', card, priceSel.redfin, 'redfin-main');
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, {attributes: false, childList: true, subtree: true});
    // Big card:
    let standalonePage = document.querySelector(cardSel.redfinBig);
    if (standalonePage !== null) {
      rapidapproverCreateBtn('redfin', standalonePage, priceSel.redfinBig, 'redfin-big');
    }
  }



  else if (domain === 'realtor') {
    for (let card of document.querySelectorAll(cardSel.realtor)) {
      rapidapproverCreateBtn('realtor', card, priceSel.realtor, 'realtor-main');
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let removedNode of mutation.removedNodes) {
          if (removedNode.classList !== undefined && removedNode.classList.contains('rapidapprover-btn')) {
            mutation.target.appendChild(removedNode);
          }
        }
        for (let addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === 1) {
            for (let card of addedNode.querySelectorAll(cardSel.realtor)) {
              rapidapproverCreateBtn('realtor', card, priceSel.realtor, 'realtor-main');
            }
            if (addedNode.querySelector(priceSel.realtorBig)) {
              rapidapproverCreateBtn('realtor', addedNode.querySelector(cardSel.realtorBig), priceSel.realtorBig, 'realtor-big');
              setTimeout(() => {
                preloadPaymentDataRealtor();
              }, 500);
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, {attributes: false, childList: true, subtree: true});
    // Big card:
    let standalonePage = document.querySelector(cardSel.realtorBig);
    if (standalonePage !== null) {
      rapidapproverCreateBtn('realtor', standalonePage, priceSel.realtorBig, 'realtor-big');
    }
  }
});


var rapidapproverParseNum = function (el) {
  let str = el.textContent.trim().replace(/[^.\d]/g, ''); // Keep only digits and period
  while (str.charAt(0) === '.') {
    str = str.slice(1);
  }
  if (el.textContent.trim().endsWith('K')) {
    str += '000';
  }
  let num = parseFloat(str);
  return isNaN(num) ? -1 : num;
}


var rapidapproverCreateBtn = function (website, currentCard, currentPriceSel, extra) {
  if (currentCard === null) {
    return;
  }
  if (currentCard.querySelector('a.rapidapprover-btn') !== null) {
    return;
  }
  let price = currentCard.querySelector(currentPriceSel);
  if (price === null) {
    return;
  }
  price = rapidapproverParseNum(price);
  if (price < 10000) {
    return;
  }

  let btn = document.createElement('a');
  btn.innerHTML = 'Add to Rapid Approver \u{27A0}\u{1F4D1}'; //unicode-table.com/en/emoji
  btn.classList.add('rapidapprover-btn');
  btn.classList.add('rapidapprover-' + website);
  btn.classList.add('rapidapprover-' + extra);

  const bigBtnContainerSel = {  // big button container != currentCard  (exclude trulia)
    truliaBig: '[data-testid="home-details-summary-container"]',
    zillowBig: '.ds-buttons', // '.ds-home-details-chip',
    redfinBig: '.HomeInfoV2',
    realtorBig: '[data-testid="listing-summary-info"]',
  }
  if (extra.endsWith('-big') && website !== 'trulia') {
    currentCard = currentCard.querySelector(bigBtnContainerSel[website + 'Big']);
  }

  currentCard.appendChild(btn);
}
