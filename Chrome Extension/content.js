//console.log("Content script loaded.")

function grabSKU(){
	//console.log("Grabbing SKU.");
	domain = (window.location.href).match(/\.([a-zA-Z0-9]*)\.com/);
	if(domain && domain.length>1){
		domain = domain[1].toLowerCase();
		console.log(domain);
		// AMAZON
		if(domain=="amazon"){
			SKU = (window.location.href).match(/gp\/product\/([0-9A-Za-z]*)/);
			if(SKU){SKU=SKU[1]};
			if(SKU==undefined||SKU==""){
				SKU = (window.location.href).match(/dp\/([0-9A-Za-z]*)/);
				if(SKU){SKU=SKU[1]};
			}
			if(SKU==undefined||SKU==""){
				SKU = $('b:contains("ASIN")').parent().text().replace("ASIN","").replace(":","").trim();
			}
			if(SKU==undefined||SKU==""){
				SKU = $('.a-color-secondary:contains("ASIN")').parent().text().replace("ASIN","").trim()
			}
			
			
			Price = $('#priceblock_dealprice').text().replace("$","");
			if(Price == undefined||Price==""){
				Price = $('#priceblock_ourprice').text().replace("$","");
			}
			if(Price == undefined||Price==""){
				Price = $('#priceblock_saleprice').text().replace("$","");
			}
			if(Price == undefined||Price==""){
				Price = $("[id*='priceblock_']").text().replace("$","");
			}
			if(Price == undefined||Price==""){
				Price = $(".a-color-price").first().text().match(/\$([0-9]*\.[0-9][0-9])/)
				if(Price){Price=Price[1];}
			}
			
			$("[id*='roductTitle']").click();
			Description = $("[id*='roductTitle']").text().trim();
			if(Description == undefined || Description==""){
				Description = "???";
			}

			return_content = JSON.stringify({"Vendor": "Amazon", "SKU": SKU,"Quantity": 1, "Price": Price, "Description": Description});
			return_message = {"type":"INT_ADD", "content":return_content};
			console.log("Content is returning Amazon parts")
			console.log(return_message);
			return return_message;
		// MCMASTER
		}else if(domain=="mcmaster"){
			response_content = [];
			$(".OrdPadProdsWebPart_AddedLnRow").each(function(index){
				Quantity = $(this).find(".OrdPadProdsWebPart_QtyInp").val()
				SKU = $(this).find(".OrdPadProdsWebPart_ItmCell").text();
				Description = $(this).find(".OrdPadProdsWebPart_PartDscCell").text().replace('Your referenceLine references cannot contain credit card numbers.','').trim();
				Price = $(this).find(".OrdPadProdsWebPart_UnitPrceCell").text().match(/([0-9]*\.[0-9][0-9])/)[1];
				response_content.push({"Vendor": "McMaster-Carr", "SKU": SKU,"Quantity": Quantity, "Price": Price, "Description": Description});
			});
			content_string = JSON.stringify(response_content);
			return_message = {"type":"INT_ADD", "content":content_string};
			console.log("Content is returning McMaster parts")
			console.log(return_message);
			return return_message;
		}
	}else{
		return {};
	}
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //console.log("Processing request from background page.");
	if(request.type=="INT_REQ_FROM_CONTENT"){
		sendResponse(grabSKU());
	}
  }
);