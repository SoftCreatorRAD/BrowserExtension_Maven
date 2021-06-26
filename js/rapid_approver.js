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
    if (evt.target && evt.target.classList.contains('rapidapprover-btn')) {
      const addressSel = {
        trulia: '[data-testid="property-street"],[data-testid="property-region"]',
        truliaBig: '[data-testid="home-details-summary-headline"], [data-testid="home-details-summary-city-state"]',
        zillow: 'address.list-card-addr',
        zillowBig: '#ds-chip-property-address',
        redfin: '.homeAddressV2',
        redfinBig: 'h1.address',
        realtor: '[data-label="pc-address"]',
        realtorBig: '.address-value', //'[data-testid="address-section"]',
      }
      const detailsSel = {
        trulia: '[r="xxs"]',
        truliaBig: '[data-testid="facts-list"] > li',
        zillow: '.list-card-details > li',
        zillowBig: '.ds-bed-bath-living-area-container > *',
        redfin: '.HomeStatsV2 > div',
        redfinBig: '.home-main-stats-variant > div',
        realtor: '.property-meta > li',
        realtorBig: '[data-testid="property-meta"] li', //'.property-meta > li',
      }
      const pictureSel = {
        trulia: '[data-testid="property-image-0"] img',
        truliaBig: 'img[class*="HomeDetailsHero__HeroImg-sc-"]', // '[data-testid="hdp-hero-img-tile"] img',
        zillow: '.list-card-img img',
        zillowBig: '.media-stream-tile--prominent img',
        redfin: '[data-rf-test-name="basic-card-photo"] *',  // sometimes it's img and sometimes div
        redfinBig: '#MBImage0 img',
        realtor: 'img.top',
        realtorBig: '.slick-track [data-index="0"] img',
      }

      let big = evt.target.classList.contains('rapidapprover-' + domain + '-big') ? 'Big' : '';
      let card = evt.target.closest(cardSel[domain + big]);

      let dataObj = {
        source: domain,
        wrapResult: false,
        actionName: 'losRA',
      };

      let priceNode = card.querySelector(priceSel[domain + big]);
      if (priceNode) {
        let priceValue = rapidapproverParseNum(priceNode);
        if (priceValue > 0) {
          dataObj.price = priceValue;
        }
      }

      let addresses = card.querySelectorAll(addressSel[domain + big]);
      let addressString = '';
      for (let address of addresses) {
        addressString += ' ' + address.textContent.trim();
      }
      addressString = addressString.replace(/#/g, '').trim();
      if (addressString !== '') {
        dataObj.address = addressString;
      }

      let details = card.querySelectorAll(detailsSel[domain + big]);
      for (let detail of details) {
        let nodeText = detail.textContent.trim();
        if (nodeText.endsWith('bds') || nodeText.endsWith('bd') || nodeText.endsWith('Beds') || nodeText.endsWith('Bed') || nodeText.endsWith('bed')) {
          let beds = rapidapproverParseNum(detail);
          if (beds > 0 && !dataObj.beds) {
            dataObj.beds = beds;
          }
        }
        if (nodeText.endsWith('ba') || nodeText.endsWith('Baths') || nodeText.endsWith('Bath') || nodeText.endsWith('bath')) {
          let baths = rapidapproverParseNum(detail);
          if (baths > 0 && !dataObj.baths) {
            dataObj.baths = baths;
          }
        }
        if (nodeText.endsWith('sqft') || nodeText.endsWith('Sq. Ft.') || nodeText.endsWith('Sq Ft')) {
          let sqft = rapidapproverParseNum(detail);
          if (sqft > 0 && !dataObj.sqft) {
            dataObj.sqft = sqft;
          }
        }
      }

      let picturePath = '';
      if (domain === 'redfin' && !big) {
        let picNodes = card.querySelectorAll(pictureSel[domain + big]);
        for (const picNode of picNodes) {
          if (!picturePath) {
            if (picNode.nodeName === 'IMG' && picNode.src) { // sometimes it's img and sometimes div
              picturePath = picNode.src;
            } else {
              picturePath = picNode.style.backgroundImage.replace(/"/g, '').replace('url(', '').replace(')', '');
            }
          }
        }
      } else if (domain === 'trulia' && big) {
        picturePath = document.querySelector(pictureSel[domain + big]).src;
      } else {
        picturePath = card.querySelector(pictureSel[domain + big]).src;
      }
      dataObj.picturePath = picturePath;

      if (domain === 'zillow' && big) {
        let propertyTaxesNode = document.querySelector('#label-property-tax');
        if (propertyTaxesNode) {
          let propertyTaxesValue = rapidapproverParseNum(propertyTaxesNode);
          if (propertyTaxesValue > 0) {
            dataObj.propertyTaxes = propertyTaxesValue;
          }
        }
        let homeInsuranceNode = document.querySelector('#label-home-insurance');
        if (homeInsuranceNode) {
          let homeInsuranceValue = rapidapproverParseNum(homeInsuranceNode);
          if (homeInsuranceValue > 0) {
            dataObj.homeInsurance = homeInsuranceValue;
          }
        }
        let hoaNode = document.querySelector('#label-hoa');
        if (hoaNode) {
          let hoaValue = rapidapproverParseNum(hoaNode);
          if (hoaValue > 0) {
            dataObj.hoa = hoaValue;
          }
        }

        let propertyTypeNodes = document.querySelectorAll('.ds-home-fact-list > li');
        for (let typeNode of propertyTypeNodes) {
          if (!dataObj.propertyType && typeNode.textContent.indexOf('Type:') !== -1) {
            dataObj.propertyType = typeNode.textContent.split('Type:')[1];
          }
        }

      } else if (domain === 'realtor' && big) {

        let uls = document.querySelectorAll('#content-payment_calculator ul');
        if (uls[0] && uls[1]) {
          let list0 = uls[0].querySelectorAll('li');
          let list1 = uls[1].querySelectorAll('li');

          for (let i = 0; i < list0.length; i++) {
            let liText = list0[i].textContent.toLowerCase();
            if (liText.includes('property') && liText.includes('tax')) {
              let propertyTaxes = rapidapproverParseNum(list1[i]);
              if (propertyTaxes > 0 && !dataObj.propertyTaxes) {
                dataObj.propertyTaxes = propertyTaxes;
              }
            } else if (liText.includes('home') && liText.includes('insurance')) {
              let homeInsurance = rapidapproverParseNum(list1[i]);
              if (homeInsurance > 0 && !dataObj.homeInsurance) {
                dataObj.homeInsurance = homeInsurance;
              }
            } else if (liText.includes('hoa')) {
              let hoa = rapidapproverParseNum(list1[i]);
              if (hoa > 0 && !dataObj.hoa) {
                dataObj.hoa = hoa;
              }
            }
          }
        }

      } else if (big) {
        let taxDetailsSel = {
          truliaBig: '[data-testid="affordability-table"] .Grid__CellBox-sc-144isrp-0',
          redfinBig: '.CalculatorSummary > .colorBarLegend > div',
          // realtorBig: '#content-payment_calculator .list-unstyled>li',
        }
        let taxDetailsNodes = document.querySelectorAll(taxDetailsSel[domain + big]);
        for (let taxNode of taxDetailsNodes) {
          let nodeTxt = taxNode.textContent.trim().toLowerCase();
          if (nodeTxt.includes('property') && nodeTxt.includes('tax')) {
            let propertyTaxes = rapidapproverParseNum(taxNode);
            if (propertyTaxes > 0 && !dataObj.propertyTaxes) {
              dataObj.propertyTaxes = propertyTaxes;
            }
          } else if (nodeTxt.includes('home') && nodeTxt.includes('insurance')) {
            let homeInsurance = rapidapproverParseNum(taxNode);
            if (homeInsurance > 0 && !dataObj.homeInsurance) {
              dataObj.homeInsurance = homeInsurance;
            }
          } else if (nodeTxt.includes('hoa')) {
            let hoa = rapidapproverParseNum(taxNode);
            if (hoa > 0 && !dataObj.hoa) {
              dataObj.hoa = hoa;
            }
          }
        }

        if (domain === 'redfin' && big) {
          let keyDetails = document.querySelectorAll('#house-info .keyDetail');
          for (const keyDetail of keyDetails) {
            if (!dataObj.propertyType && keyDetail.textContent.indexOf('Property Type') !== -1) {
              dataObj.propertyType = keyDetail.textContent.replace('Property Type', '');
            }
          }
        } else if (domain === 'realtor' && big) {
          let propItems = document.querySelectorAll('[data-testid="listing-indicator"]>li');
          for (const propItem of propItems) {
            if (!dataObj.propertyType && propItem.textContent.indexOf('Property Type') !== -1) {
              dataObj.propertyType = propItem.textContent.replace('Property Type', '');
            }
          }
        } else if (domain === 'trulia' && big) {
          let propItems = document.querySelectorAll('[data-testid="structured-amenities-table-category"] [class*="Feature__FeatureListItem-sc-"]');
          for (const propItem of propItems) {
            if (!dataObj.propertyType && propItem.textContent.indexOf('Property Type:') !== -1) {
              dataObj.propertyType = propItem.textContent.replace('Property Type:', '').replace(/"/g, '').trim();
            }
          }
        }
      }

      chrome.runtime.sendMessage(JSON.stringify(dataObj));
      console.table(dataObj);
      //alert(JSON.stringify(dataObj, null, '  '));
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
