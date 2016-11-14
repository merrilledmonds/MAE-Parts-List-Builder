newLineText = "";
function extractNewLineText(){
	newLineText = $("#items-list").first().html();
}

additionalVendors = ["Sigma-Aldrich","MSC Industrial","Airgas","Digikey","Rutgers Chem Stockroom","Lowe's","VWR","Sigma-Aldrich","Fisher Scientific","Grainger","3DR","National Balsa","Custom Thermoelectric"];
function injectAdditionalVendors(){
	$(".item-vendor-input").each(function(index){
		for(vendor_index=0; vendor_index<additionalVendors.length;vendor_index++){
			$(this).append("<option value=\""+additionalVendors[vendor_index]+"\">"+additionalVendors[vendor_index]+"</option>");
		}
	});
	$(".vendor-list-text").each(function(index){
		for(vendor_index=0; vendor_index<additionalVendors.length;vendor_index++){
			$(this).append("<li class=\"list-group-item\">"+additionalVendors[vendor_index]+"</li>");
		}
	});
}

function recalculate(){
	orderTotal = 0;
	$(".items-list-line").each(function(index){
		quantity = parseFloat($(this).find(".item-quantity-input").val());
		price = parseFloat($(this).find(".item-price-input").val());
		total = (quantity*price).toFixed(2);
		if(isNaN(total)){
			total = "0.00"
		}else{
			orderTotal += parseFloat(total);
		}
		$(this).find(".item-total").text("$"+total);
	});
	$("#order-summary-total-text").text("$"+orderTotal.toFixed(2))
}

function deleteClicked(clicked){
	clicked.parent().parent().remove();
	if($("#items-list").children().length==0){
		addLine();
	}
}
function addLine(){
	addedLine = $("#items-list").append(newLineText).children().last()	;
	$("#items-list").children().last().find("button").click(function(){
		deleteClicked($(this));
	});
	rebindUpdateFunctions();
	return addedLine;
}
function clearList(){
	$("#items-list").empty();
	addLine();
}
function clearListCompletely(){
	$("#items-list").empty();
}

function rebindButtons(){
	$(".btn").unbind('click');
	
	$(".button-delete").click(function(){
		deleteClicked($(this));
	});
	$(".button-add").click(function(){
		addLine();
	});
	$(".button-clear").click(function(){
		clearList();
	});
	$(".button-submit").click(function(){
		if(parseForm()){
			saveData();
		}
	});
	$(".button-save").click(function(){
		parseForm();
		saveData();
	});
}
function rebindUpdateFunctions(){
	$(".item-recalculate").unbind('change');
	
	$(".item-recalculate").change(function(){
		recalculate();
	});
}

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
	injectAdditionalVendors();
	extractNewLineText();
	
	rebindButtons();
	rebindUpdateFunctions();

	loadData();
});