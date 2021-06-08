const DEBUG = true;
const domain = location.hostname.split('.').reverse()[1];
var big = '';

const cardSel = {
  trulia: '[data-testid="home-card-sale"]',
  truliaBig: '[data-testid="home-details-summary-container"]',
  zillow: 'article.list-card',
  zillowBig: '#search-detail-lightbox .ds-home-details-chip',
  redfin: '',
  redfinBig: '',
  redfinca: '',
  redfincaBig: '',
  realtor: '',
  realtorBig: '',
}
const priceSel = {
  trulia: '[data-testid="property-price"]',
  truliaBig: '[data-testid="home-details-sm-lg-xl-price-details"]>h3', // Markup differs when "AgentListings/Other" switched
  zillow: '.list-card-price',
  zillowBig: '.ds-chip .ds-summary-row > span:first-child',
  redfin: '',
  redfinBig: '',
  redfinca: '',
  redfincaBig: '',
  realtor: '',
  realtorBig: '',
}


document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('click', function (evt) {
    const addressSel = {
      trulia: '[data-testid="property-street"],[data-testid="property-region"]',
      truliaBig: '[data-testid="home-details-summary-headline"], [data-testid="home-details-summary-city-state"]',
      zillow: 'address.list-card-addr',
      zillowBig: '#ds-chip-property-address',
      redfin: '',
      redfinBig: '',
      redfinca: '',
      redfincaBig: '',
      realtor: '',
      realtorBig: '',
    }
    const detailsSel = {
      trulia: '[r="xxs"]',
      truliaBig: '[data-testid="facts-list"] > li',
      zillow: '.list-card-details > li',
      zillowBig: '.ds-bed-bath-living-area-container > *',
      redfin: '',
      redfinBig: '',
      redfinca: '',
      redfincaBig: '',
      realtor: '',
      realtorBig: '',
    }
    if (evt.target && evt.target.classList.contains('mavenloan-btn')) {
      let url = 'http://app.maven.loan/api/Custom/Process?actionName=losMaven&wrapResult=false&source=' + domain;
      big = evt.target.classList.contains('mavenloan-' + domain + '-big') ? 'Big' : '';

      let card = evt.target.closest(cardSel[domain + big]);
      if (!card) {
        DEBUG && console.log('CANT FIND CARD ON DOMAIN: ' + domain);
        return;
      }

      let price = card.querySelector(priceSel[domain + big]);
      if (price === null) {
        DEBUG && console.log('PRICE IS NULL ', card);
        return;
      }
      price = mavenloanParseNum(price);
      if (price < 10000) {
        DEBUG && console.log('PRICE < 10000 = ' + price, card);
        return;
      }
      url += `&price=${price}`;

      let addresses = card.querySelectorAll(addressSel[domain + big]);
      let addressString = '';
      for (let address of addresses) {
        addressString += ' ' + address.textContent.trim();
      }
      addressString = addressString.replace(/#/g, "").trim();
      if (addressString !== '') {
        url += `&address=${addressString}`;
      }

      let details = card.querySelectorAll(detailsSel[domain + big]);
      for (let detail of details) {
        let nodeText = detail.textContent.trim();
        if (nodeText.endsWith("bds") || nodeText.endsWith("bd") || nodeText.endsWith("Beds") || nodeText.endsWith("Bed")) {
          let beds = mavenloanParseNum(detail);
          if (beds > 0 && url.indexOf('&beds=') === -1) {
            url += `&beds=${beds}`;
          }
        }
        if (nodeText.endsWith("ba") || nodeText.endsWith("Baths") || nodeText.endsWith("Bath")) {
          let baths = mavenloanParseNum(detail);
          if (baths > 0 && url.indexOf('&baths=') === -1) {
            url += `&baths=${baths}`;
          }
        }
        if (nodeText.endsWith("sqft") || nodeText.endsWith("Sq. Ft.")) {
          let sqft = mavenloanParseNum(detail);
          if (sqft > 0 && url.indexOf('&sqft=') === -1) {
            url += `&sqft=${sqft}`;
          }
        }
      }

      DEBUG && console.log(encodeURI(url));
      DEBUG && console.log('------------- PREV PRICE: -------------');  // Markup differs when "AgentListings/Other" switched
      DEBUG && console.log(evt.target.dataset.url);
      //window.open(url, 'mavenloan');
      //chrome.runtime.sendMessage(url);
    }
  });


  if (window.location.hostname.includes("zillow")) {
    let propertiesParent = document.getElementById("grid-search-results");
    if (propertiesParent === null) {
      return;
    }

    for (let card of propertiesParent.querySelectorAll(cardSel.zillow)) {
      mavenloanCreateBtn("zillow", card, priceSel.zillow, "zillow-main");
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.zillow)) {
              mavenloanCreateBtn("zillow", card, priceSel.zillow, "zillow-main");
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(propertiesParent, {attributes: false, childList: true, subtree: true});
    let detailsPopup = document.getElementById("home-detail-lightbox-container");
    let detailsMutationCallback = function (mutations) {
      if (mutations[0].addedNodes.length > 0) {
        mavenloanCreateBtn("zillow", detailsPopup.querySelector(cardSel.zillowBig), priceSel.zillowBig, "zillow-big");
      }
    };
    let detailsObserver = new MutationObserver(detailsMutationCallback);
    detailsObserver.observe(detailsPopup, {attributes: false, childList: true, subtree: true});
  }



  else if (window.location.hostname.includes("trulia")) {
    for (let card of document.querySelectorAll(cardSel.trulia)) {
      mavenloanCreateBtn("trulia", card, priceSel.trulia);
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains("mavenloan-btn")) {
            mutation.target.appendChild(node);
          }
        }

        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(cardSel.trulia)) {
              mavenloanCreateBtn("trulia", card, priceSel.trulia);
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, {attributes: false, childList: true, subtree: true});

    let standalonePage = document.querySelector(cardSel.truliaBig);
    if (standalonePage !== null) {
      mavenloanCreateBtn("trulia", standalonePage, priceSel.truliaBig, "trulia-big");
    }
  }



  else if (window.location.hostname.includes("redfin")) {
    for (let card of document.querySelectorAll(".HomeCard .bottomV2")) {
      mavenloanCreateBtn("redfin", card, ".homecardV2Price", ".homeAddressV2", ".HomeStatsV2 > .stats", "redfin-main");
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains("mavenloan-btn")) {
            mutation.target.appendChild(node);
          }
        }
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll(".HomeCard .bottomV2, .SimilarHomeCardReact .bottomV2")) {
              mavenloanCreateBtn("redfin", card, ".homecardV2Price", ".homeAddressV2", ".HomeStatsV2 > .stats", "redfin-main");
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, {attributes: false, childList: true, subtree: true});

    let standalonePage = document.querySelector(".HomeInfo");
    if (standalonePage !== null) {
      mavenloanCreateBtn(
        "redfin",
        standalonePage,
        ".price",
        ".address",
        ".HomeMainStats .info-block",
        "redfin-big"
      );
    }
  }



  else if (window.location.hostname.includes("realtor")) {
    for (let card of document.querySelectorAll("[data-testid='property-detail']")) {
      mavenloanCreateBtn("realtor", card, "[data-label='pc-price']", "[data-label='pc-address']", ".property-meta", "[r='xxs']");
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.removedNodes) {
          if (node.classList !== undefined && node.classList.contains("mavenloan-btn")) {
            mutation.target.appendChild(node);
          }
        }
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll("[data-testid='home-card-sale']")) {
              mavenloanCreateBtn("realtor", card, "[data-testid='property-price']", "address.list-card-addr", "[r='xxs']");
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(document, {attributes: false, childList: true, subtree: true});

    let standalonePage = document.querySelector("[data-testid='home-details-summary-container']");
    if (standalonePage !== null) {
      mavenloanCreateBtn(
        "realtor",
        standalonePage,
        "[data-testid='on-market-price-details']",
        "[data-testid='home-details-summary-headline'], [data-testid='home-details-summary-city-state']",
        "[data-testid='facts-list'] > li",
        "realtor-big"
      );
    }
  }
});




// Keep only digits and period
var mavenloanParseNum = function (el) {
  let str = el.textContent.trim().replace(/[^.\d]/g, "");

  if (el.textContent.trim().endsWith("K")) {
    str += "000";
  }

  let num = parseFloat(str);
  if (isNaN(num)) {
    return -1;
  } else {
    return num;
  }
}


var mavenloanCreateBtn = function (website, currentCard, currentPriceSel, extra) {
  if (currentCard === null) {
    return;
  }
  if (currentCard.querySelector("a.mavenloan-btn") !== null) {
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
  let btn = document.createElement("a");
  // Emoji location: //unicode-table.com/en/emoji/
  btn.innerHTML = "Add to Maven \u{27A0}\u{1F4D1}";
  btn.classList.add("mavenloan-btn");
  btn.classList.add(`mavenloan-${website}`);
  if (extra) {
    btn.classList.add(`mavenloan-${extra}`);
  }
  let url = "http://app.maven.loan/api/Custom/Process?actionName=losMaven&wrapResult=false";
  url += `&source=${website}`;
  url += `&price=${price}`;

  btn.setAttribute('data-url', encodeURI(url));
  currentCard.appendChild(btn);
}
