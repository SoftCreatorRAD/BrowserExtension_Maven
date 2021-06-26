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
  zillowBig: '.ds-home-details-chip .ds-summary-row > span:first-child, .ds-chip div[class*="Flex-"]>div[class*="Flex-"]>span[class*="Text-"]',
  redfin: '.homecardV2Price',
  redfinBig: '.price-section',
  realtor: '[data-label="pc-price"]',
  realtorBig: '[data-testid="list-price"]',
}


// Preloaders for trulia and realtor:
window.addEventListener('load', function () {
  if (domain === 'trulia') {
    setTimeout(() => {
      let preloadContainer = document.querySelector('[data-testid="affordability-placeholder"]');
      if (preloadContainer) {
        let offset = {
          x: window.pageXOffset,
          y: window.pageYOffset
        }
        preloadContainer.scrollIntoView(true);
        setTimeout(function () {
          window.scrollTo(offset.x, offset.y);
        }, 20);
      }
    }, 0);
  } else if (domain === 'realtor') {
    setTimeout(() => {
      preloadPaymentDataRealtor();
    }, 500);
  }
});

// line 200
let preloadPaymentDataRealtor = function () {
  let btn = document.querySelector('[data-label="Monthly Payment"]>[data-testid="section-toggle"]');
  if (btn) {
    let offset = {
      x: window.pageXOffset,
      y: window.pageYOffset
    }
    btn.scrollIntoView(true);
    setTimeout(() => {
      btn.click();
      setTimeout(() => {
        window.scrollTo(offset.x, offset.y);
      }, 50);
    }, 50);
  }
}



document.addEventListener('DOMContentLoaded', function () {

  document.addEventListener('click', function (evt) {
    let dataObj = getParsed(evt.target, cardSel, priceSel);
    if (dataObj) {
      let json = JSON.stringify(dataObj);
      chrome.runtime.sendMessage(json);
      console.log(JSON.stringify(dataObj, null, '  '));
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
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains('rapidapprover-btn')) {
            mutation.target.appendChild(node);
          }
        }
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.realtor)) {
              rapidapproverCreateBtn('realtor', card, priceSel.realtor, 'realtor-main');
            }
            if (node.querySelector(priceSel.realtorBig)) {
              rapidapproverCreateBtn('realtor', node.querySelector(cardSel.realtorBig), priceSel.realtorBig, 'realtor-big');
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
