document.addEventListener("DOMContentLoaded", function () {

  document.addEventListener('click', function (event) {
    if (event.target && event.target.classList.contains('mavenloan-btn')) {
      //debugger;
      //window.open(event.target.getAttribute('data-url'), 'mavenloan');
      var url = event.target.getAttribute('data-url');
      chrome.runtime.sendMessage(url);
      console.log(url);
    }
  });


  if (window.location.hostname.includes("zillow")) {
    let propertiesParent = document.getElementById("grid-search-results");
    if (propertiesParent === null) {
      return;
    }

    for (let card of propertiesParent.querySelectorAll("article.list-card")) {
      mavenloanCreateBtn("zillow", card, ".list-card-price", "address.list-card-addr", ".list-card-details > li", "zillow-main");
    }
    let mainMutationCallback = function (mutations) {
      for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            for (let card of node.querySelectorAll("article.list-card")) {
              mavenloanCreateBtn("zillow", card, ".list-card-price", "address.list-card-addr", ".list-card-details > li", "zillow-main");
            }
          }
        }
      }
    };
    let mainObserver = new MutationObserver(mainMutationCallback);
    mainObserver.observe(propertiesParent, {attributes: false, childList: true, subtree: true});

    let detailsPopup = document.getElementById("home-detail-lightbox-container");
    if (detailsPopup !== null) {
      let detailsMutationCallback = function (mutations) {
        if (mutations[0].addedNodes.length > 0) {
          mavenloanCreateBtn(
            "zillow",
            detailsPopup.querySelector("#details-page-container .ds-home-details-chip"),
            ".ds-summary-row h4",
            ".ds-price-change-address-row h1",
            ".ds-summary-row .h3 > span, .ds-summary-row h3 > button",
            "zillow-big"
          );
        }
      };
      let detailsObserver = new MutationObserver(detailsMutationCallback);
      detailsObserver.observe(detailsPopup, {attributes: false, childList: true, subtree: true});
    }
  }



  else if (window.location.hostname.includes("trulia")) {
    for (let card of document.querySelectorAll("[data-testid='home-card-sale']")) {
      mavenloanCreateBtn("trulia", card, "[data-testid='property-price']", "[data-testid='property-street'],[data-testid='property-region']", "[r='xxs']");
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
              mavenloanCreateBtn("trulia", card, "[data-testid='property-price']", "[data-testid='property-street'],[data-testid='property-region']", "[r='xxs']");
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
        "trulia",
        standalonePage,
        "[data-testid='on-market-price-details']",
        "[data-testid='home-details-summary-headline'], [data-testid='home-details-summary-city-state']",
        "[data-testid='facts-list'] > li",
        "trulia-big"
      );
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


var mavenloanCreateBtn = function (website, card, priceSel, addressSel, detailsSel, extra) {
  if (card === null) {
    return;
  }
  if (card.querySelector("a.mavenloan-btn") !== null) {
    return;
  }
  let price = card.querySelector(priceSel);
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
  //let url = "http://app.maven.loan/api/Custom/Process?actionName=losMaven&wrapResult=false";
  let url = "?actionName=losMaven&wrapResult=false";
  url += `&source=${website}`;
  url += `&price=${price}`;

  let addresses = card.querySelectorAll(addressSel);
  let addressString = '';
  for (let address of addresses) {
    addressString += ' ' + address.textContent.trim();
  }
  addressString = addressString.replace(/#/g, "").trim();
  if (addressString !== '') {
    url += `&address=${addressString}`;
  }

  let details = card.querySelectorAll(detailsSel);
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

  btn.setAttribute('data-url', encodeURI(url));
  card.appendChild(btn);
}
