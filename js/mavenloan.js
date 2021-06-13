const domain = location.hostname.split('.').reverse()[1];
let big = '';

const cardSel = {
  trulia: '[data-testid="home-card-sale"]',
  truliaBig: '[data-testid="home-details-summary-container"]',
  zillow: 'article.list-card',
  zillowBig: '#search-detail-lightbox .ds-home-details-chip',
  redfin: '.HomeCard .v2',
  redfinBig: '.HomeInfoV2',
  realtor: '[data-testid="property-list-container"] [data-testid="property-card"]',
  realtorBig: '[data-testid="listing-summary-info"]', // '[data-testid="listing-details-id"]',
}
const priceSel = {
  trulia: '[data-testid="property-price"]',
  truliaBig: '[data-testid="home-details-sm-lg-xl-price-details"]>h3',
  zillow: '.list-card-price',
  zillowBig: '.ds-chip .ds-summary-row > span:first-child',
  redfin: '.homecardV2Price',
  redfinBig: '.price-section',
  realtor: '[data-label="pc-price"]',
  realtorBig: '[data-testid="list-price"]',
}


document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('click', function (evt) {
    if (evt.target && evt.target.classList.contains('mavenloan-btn')) {
      const addressSel = {
        trulia: '[data-testid="property-street"],[data-testid="property-region"]',
        truliaBig: '[data-testid="home-details-summary-headline"], [data-testid="home-details-summary-city-state"]',
        zillow: 'address.list-card-addr',
        zillowBig: '#ds-chip-property-address',
        redfin: '.homeAddressV2',
        redfinBig: 'h1.address',
        realtor: '[data-label="pc-address"]',
        realtorBig: '[data-testid="address-section"]',
      }
      const detailsSel = {
        trulia: '[r="xxs"]',
        truliaBig: '[data-testid="facts-list"] > li',
        zillow: '.list-card-details > li',
        zillowBig: '.ds-bed-bath-living-area-container > *',
        redfin: '.HomeStatsV2 > div',
        redfinBig: '.home-main-stats-variant > div',
        realtor: '.property-meta > li',
        realtorBig: '.property-meta > li',
      }
      let url = 'http://app.maven.loan/api/Custom/Process?actionName=losMaven&wrapResult=false&source=' + domain;
      big = evt.target.classList.contains('mavenloan-' + domain + '-big') ? 'Big' : '';

      let card = evt.target.closest(cardSel[domain + big]);

      if (!card) {
        return;
      }
      let price = card.querySelector(priceSel[domain + big]);
      if (price === null) {
        return;
      }
      price = mavenloanParseNum(price);
      if (price < 10000) {
        return;
      }
      url += `&price=${price}`;

      let addresses = card.querySelectorAll(addressSel[domain + big]);
      let addressString = '';
      for (let address of addresses) {
        addressString += ' ' + address.textContent.trim();
      }
      addressString = addressString.replace(/#/g, '').trim();
      if (addressString !== '') {
        url += `&address=${addressString}`;
      }

      let details = card.querySelectorAll(detailsSel[domain + big]);
      for (let detail of details) {
        let nodeText = detail.textContent.trim();
        if (nodeText.endsWith('bds') || nodeText.endsWith('bd') || nodeText.endsWith('Beds') || nodeText.endsWith('Bed') || nodeText.endsWith('bed')) {
          let beds = mavenloanParseNum(detail);
          if (beds > 0 && url.indexOf('&beds=') === -1) {
            url += `&beds=${beds}`;
          }
        }
        if (nodeText.endsWith('ba') || nodeText.endsWith('Baths') || nodeText.endsWith('Bath') || nodeText.endsWith('bath')) {
          let baths = mavenloanParseNum(detail);
          if (baths > 0 && url.indexOf('&baths=') === -1) {
            url += `&baths=${baths}`;
          }
        }
        if (nodeText.endsWith('sqft') || nodeText.endsWith('Sq. Ft.') || nodeText.endsWith('Sq Ft')) {
          let sqft = mavenloanParseNum(detail);
          if (sqft > 0 && url.indexOf('&sqft=') === -1) {
            url += `&sqft=${sqft}`;
          }
        }
      }
      //chrome.runtime.sendMessage(url);
      console.log(url);
    }
  });



  if (window.location.hostname.includes('zillow')) {
    let propertiesParent = document.getElementById('grid-search-results');
    if (propertiesParent === null) {
      return;
    }

    for (let card of propertiesParent.querySelectorAll(cardSel.zillow)) {
      mavenloanCreateBtn('zillow', card, priceSel.zillow, 'zillow-main');
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.zillow)) {
              mavenloanCreateBtn('zillow', card, priceSel.zillow, 'zillow-main');
            }
            if (node.querySelector(priceSel.zillow)) {
              mavenloanCreateBtn('zillow', node.closest(cardSel.zillow), priceSel.zillow, 'zillow-main');
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(propertiesParent, {attributes: false, childList: true, subtree: true});

    // Big card:
    let detailsPopup = document.getElementById('home-detail-lightbox-container');
    let detailsMutationCallback = function (mutations) {
      if (mutations[0].addedNodes.length > 0) {
        mavenloanCreateBtn('zillow', detailsPopup.querySelector(cardSel.zillowBig), priceSel.zillowBig, 'zillow-big');
      }
    };
    let detailsObserver = new MutationObserver(detailsMutationCallback);
    detailsObserver.observe(detailsPopup, {attributes: false, childList: true, subtree: true});
  }



  else if (window.location.hostname.includes('trulia')) {
    for (let card of document.querySelectorAll(cardSel.trulia)) {
      mavenloanCreateBtn('trulia', card, priceSel.trulia, 'trulia-main');
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains('mavenloan-btn')) {
            mutation.target.appendChild(node);
          }
        }

        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.trulia)) {
              mavenloanCreateBtn('trulia', card, priceSel.trulia, 'trulia-main');
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
      mavenloanCreateBtn('trulia', standalonePage, priceSel.truliaBig, 'trulia-big');
    }
  }



  else if (window.location.hostname.includes('redfin')) {
    for (let card of document.querySelectorAll(cardSel.redfin)) {
      mavenloanCreateBtn('redfin', card, priceSel.redfin, 'redfin-main');
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains('mavenloan-btn')) {
            mutation.target.appendChild(node);
          }
        }
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.redfin)) { //'.HomeCard .bottomV2, .SimilarHomeCardReact .bottomV2'
              mavenloanCreateBtn('redfin', card, priceSel.redfin, 'redfin-main');
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, {attributes: false, childList: true, subtree: true});

    let standalonePage = document.querySelector(cardSel.redfinBig);
    if (standalonePage !== null) {
      mavenloanCreateBtn('redfin', standalonePage, priceSel.redfinBig, 'redfin-big');
    }
  }



  else if (window.location.hostname.includes('realtor')) {
    for (let card of document.querySelectorAll(cardSel.realtor)) {
      mavenloanCreateBtn('realtor', card, priceSel.realtor, 'realtor-main');
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains('mavenloan-btn')) {
            mutation.target.appendChild(node);
          }
        }
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.realtor)) {
              mavenloanCreateBtn('realtor', card, priceSel.realtor, 'realtor-main');
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, {attributes: false, childList: true, subtree: true});
    // Big:
    let standalonePage = document.querySelector(cardSel.realtorBig);
    if (standalonePage !== null) {
      mavenloanCreateBtn('realtor', standalonePage, priceSel.realtorBig, 'realtor-big');
    }
  }
});


var mavenloanParseNum = function (el) {
  let str = el.textContent.trim().replace(/[^.\d]/g, ''); // Keep only digits and period
  while(str.charAt(0) === '.') {
    str = str.slice(1);
  }
  if (el.textContent.trim().endsWith('K')) {
    str += '000';
  }
  let num = parseFloat(str);
  return isNaN(num) ? -1 : num;
}


var mavenloanCreateBtn = function (website, currentCard, currentPriceSel, extra) {
  if (currentCard === null) {
    return;
  }
  if (currentCard.querySelector('a.mavenloan-btn') !== null) {
    return;
  }
  let price = currentCard.querySelector(currentPriceSel);
  if (price === null) {
    return;
  }
  price = mavenloanParseNum(price);
  if (price < 10000) {
    return;
  }

  let btn = document.createElement('a');
  // Emoji location: //unicode-table.com/en/emoji/
  btn.innerHTML = 'Add to Maven \u{27A0}\u{1F4D1}';
  btn.classList.add('mavenloan-btn');
  btn.classList.add(`mavenloan-${website}`);
  if (extra) {
    btn.classList.add(`mavenloan-${extra}`);
  }

  currentCard.appendChild(btn);
}
