function getParsed(targetElement, cardSel, priceSel, domain) {
  let big = targetElement.classList.contains('rapidapprover-' + domain + '-big') ? 'Big' : '';
  let card = targetElement.closest(cardSel[domain + big]);
  let dataObj = {
    source: domain,
    wrapResult: false,
    actionName: 'losRA',
  };

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

  // Price parser:
  let priceNode = card.querySelector(priceSel[domain + big]);
  if (priceNode) {
    let priceValue = rapidapproverParseNum(priceNode);
    if (priceValue > 0) {
      dataObj.price = priceValue;
    }
  }

  // Address parser:
  let addresses = card.querySelectorAll(addressSel[domain + big]);
  let addressString = '';
  for (let address of addresses) {
    addressString += ' ' + address.textContent.trim();
  }
  addressString = addressString.replace(/#/g, '').trim();
  if (addressString !== '') {
    dataObj.address = addressString;
  }

  // Details parser:
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

  // Picture parser:
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


  // MonthlyPayment parsers (for big card only):
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
    let taxDetailsSelectorRealtorBig = '#content-payment_calculator .list-unstyled>li';
    let taxDetailsNodes = document.querySelectorAll(taxDetailsSelectorRealtorBig);

    if (taxDetailsNodes.length) {
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
    } else {
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
    }

    let propItems = document.querySelectorAll('[data-testid="listing-indicator"]>li');
    for (const propItem of propItems) {
      if (!dataObj.propertyType && propItem.textContent.indexOf('Property Type') !== -1) {
        dataObj.propertyType = propItem.textContent.replace('Property Type', '');
      }
    }

  } else if ((domain === 'trulia' || domain === 'redfin') && big) {
    let taxDetailsSel = {
      truliaBig: '[data-testid="affordability-table"] .Grid__CellBox-sc-144isrp-0',
      redfinBig: '.CalculatorSummary > .colorBarLegend > div',
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
    } else if (domain === 'trulia' && big) {
      let propItems = document.querySelectorAll('[data-testid="structured-amenities-table-category"] [class*="Feature__FeatureListItem-sc-"]');
      for (const propItem of propItems) {
        if (!dataObj.propertyType && propItem.textContent.indexOf('Property Type:') !== -1) {
          dataObj.propertyType = propItem.textContent.replace('Property Type:', '').replace(/"/g, '').trim();
        }
      }
    }
  }

  return dataObj;
}
