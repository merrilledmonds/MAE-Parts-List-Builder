Settings = {};
Parts = [];
storageKey = "shoppingCart";
storageKeySettings = "shoppingSettings";

function saveData(){
	localStorage.setItem(storageKey, JSON.stringify(Parts));
	localStorage.setItem(storageKeySettings, JSON.stringify(Settings));
	console.log("Saved data: "+Parts.length+" items.");
	console.log("Saved data: "+Object.keys(Settings).length+" settings.");
};
function loadData(){
	Parts = localStorage.getItem(storageKey);
	Parts = Parts && JSON.parse(Parts);
	Settings = localStorage.getItem(storageKeySettings);
	Settings = Settings && JSON.parse(Settings);
	if(Parts!=null){
		console.log("Loaded data: "+Parts.length+" items.");
	}else{
		console.log("Could not load parts, initializing new list.")
		Parts = [];
	}
	if(Settings!=null){
		console.log("Loaded data: "+Object.keys(Settings).length+" settings.");
	}else{
		console.log("Could not load settings, initializing new object.");
		Settings = {};
	}
	updateForm();
};
function clearData(){
	localStorage.removeItem(storageKey);
	localStorage.removeItem(storageKeySettings);
	console.log("Cleared data.");
};


Log = console.log;

function getTotal(){
	updateTotal_total = 0;
	for(updateTotal_i=0;updateTotal_i<Parts.length;updateTotal_i++){
		updateTotal_part = Parts[updateTotal_i]
		updateTotal_total+=parseFloat(updateTotal_part.Quantity)*parseFloat(updateTotal_part.Price);
	}
	orderTotal = updateTotal_total;
	return (typeof orderTotal != "undefined")?orderTotal.toFixed(2):"000";
}
function getFormInput(id,parent_element){
	parent_element = (typeof parent_element != "undefined")?parent_element:$("html");
	element = parent_element.find("#"+id).val();
	if(typeof element == "undefined"){
		element = parent_element.find("."+id).val();
	}
	return element;
}
function clearSettings(){
	Settings = {};
}
function clearParts(){
	Parts=[];
}
function populateSettings(){
	settingsValid = true;
	Settings = {groupNumber:getFormInput("settings-group-number"),
			projectName:getFormInput("settings-project-name"),
			advisor:getFormInput("settings-advisor"),
			leaderNetID:getFormInput("settings-leader-netid"),
			leaderName:getFormInput("settings-leader-name"),
			leaderEmail:getFormInput("settings-leader-email"),
			recipientNetID:getFormInput("settings-recipient-netid"),
			recipientName:getFormInput("settings-recipient-name"),
			recipientEmail:getFormInput("settings-recipient-email"),
			recipientPhone:getFormInput("settings-recipient-phone")
			};
	for(key in Settings){
		if(!Settings[key]){
			settingsValid = false;
			inputLabel = key.replace(/([a-z])([A-Z])([a-z])/g,'$1-$2$3').toLowerCase();
			$("#settings-"+inputLabel).addClass("has-error",150,"linear");
			$("#settings-"+inputLabel).removeClass("has-error",2500,"linear");
		}
	}
	return settingsValid;
}
function isLineValid(lineObject){
	return lineObject.Vendor && lineObject.SKU && lineObject.Quantity && $.isNumeric(lineObject.Quantity) && lineObject.Price && $.isNumeric(lineObject.Price) && lineObject.Description;
}
function populateParts(){
	partsValid = true;
	$(".items-list-line").each(function(){
		lineObject = {Vendor:getFormInput("item-vendor-input",$(this)), SKU:getFormInput("item-sku-input",$(this)), Quantity:getFormInput("item-quantity-input",$(this)), Price:getFormInput("item-price-input",$(this)), Description:getFormInput("item-description-input",$(this))};
		//Log(lineObject);
		if(isLineValid(lineObject)){
			Parts.push(lineObject)
			$(this).removeClass("has-error").removeClass("has-warning");
			//$(this).addClass("has-success",50,"linear");
			//$(this).removeClass("has-success",500,"linear");
		}else{
			partsValid = false;
			$(this).removeClass("has-success").removeClass("has-warning");
			$(this).addClass("has-error",150,"linear");
			$(this).removeClass("has-error",2500,"linear");
		}
	});
	return partsValid;
}
function scrollToSettings(){
	$('html, body').animate({
		scrollTop: $("#collapse-group-info").offset().top
	},1000);
}
function scrollToParts(){
	$('html, body').animate({
		scrollTop: $("#items-list").offset().top
	},1000);
}
function parseForm(){
	clearParts();
	clearSettings();
	if(populateSettings()){
		if(populateParts()){
			downloadCSV();
			downloadForm();
			return true;
		}else{
			scrollToParts();
		}
	}else{
		$("#collapse-group-info").collapse("show");
		scrollToSettings();
		if(!populateParts()){
			setTimeout(function(){
				scrollToParts();
			},1100);
		}
	}
	return false;
}

function updateForm(){
	if(Settings && Object.keys(Settings).length>0){
		for(key in Settings){
			if(Settings[key]){
				inputLabel = key.replace(/([a-z])([A-Z])([a-z])/g,'$1-$2$3').toLowerCase();
				Log(inputLabel);
				$("#settings-"+inputLabel).val(Settings[key]);
			}
		}
	}
	if(Parts && Parts.length>0){
		clearListCompletely();
		for(parts_index=0;parts_index<Parts.length;parts_index++){
			part = Parts[parts_index];
			newLine = addLine();
			if(part && Object.keys(part).length>0){
				for(key in part){
					inputLabel = key.replace(/([a-z])([A-Z])([a-z])/g,'$1-$2$3').toLowerCase();
					newLine.find(".item-"+inputLabel+"-input").val(part[key]);
				}
			}
		}
	}
}


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function downloadImportable(){
	txtContent = "data:text/plain;charset=utf-8,"
	txtContent += "Version 1\r\n";
	txtContent += JSON.stringify(Settings)+"\r\n";
	txtContent += JSON.stringify(Parts)+"\r\n";
	encodedUri = encodeURI(txtContent);
	link = document.createElement("a");
	link.setAttribute("href",encodedUri);
	link.setAttribute("download","extensionSettings.txt");
	document.body.appendChild(link);
	link.click();
}
function downloadCSV(){
	parts = Parts;
	settings = Settings;
	csvContent = "data:text/csv;charset=utf-8,";
	csvContent += "Group Number,"+settings.groupNumber+",,,,\n";
	csvContent += "Project Name,"+settings.projectName+",,,,\n";
	csvContent += "Advisor,"+settings.advisor+",,,,\n";
	csvContent += "Leader Name,"+settings.leaderName+",,,,\n";
	csvContent += "Leader NetID,"+settings.leaderNetID+",,,,\n";
	csvContent += "Leader Email,"+settings.leaderEmail+",,,,\n";
	csvContent += "Recipient Name,"+settings.recipientName+",,,,\n";
	csvContent += "Recipient NetID,"+settings.recipientNetID+",,,,\n";
	csvContent += "Recipient Email,"+settings.recipientEmail+",,,,\n";
	csvContent += "Recipient Phone,"+settings.recipientPhone+",,,,\n";
	csvContent += "Vendor,SKU,Quantity,Unit Price,Item Total,Description\n";
	for(i=0;i<Parts.length;i++){
		part = Parts[i];
		dataString = part.Vendor+","+part.SKU+","+part.Quantity+","+parseFloat(part.Price).toFixed(2)+","+(parseFloat(part.Price)*parseFloat(part.Quantity)).toFixed(2)+","+part.Description.split(",").join(";");
		csvContent += dataString+"\n";
	}
	encodedUri = encodeURI(csvContent);
	link = document.createElement("a");
	link.setAttribute("href",encodedUri);
	link.setAttribute("download",""+settings.groupNumber+"_"+Math.floor(Date.now()/100/60/60/24)+".csv");
	document.body.appendChild(link);
	link.click();
};

function downloadForm(){
	parts = Parts;
	orderInfo = Settings;

	settings={
		lmargin: 0.75,
		rmargin: 0.75,
		tmargin: 0.75,
		bmargin: 1.75,
		width: 8.5,
		height: 11};
	topGroupInfo = 1.5;
	centralDividerThickness = 0.15;
	leftGroupInfo = settings.lmargin;
	rightGroupInfo = settings.width/2-centralDividerThickness/2;
	topRecipientInfo = topGroupInfo;
	leftRecipientInfo = settings.width/2+centralDividerThickness/2;
	rightRecipientInfo = settings.width-settings.rmargin;
	topDisclaimer = topGroupInfo+1.5;
	topRecipientSignature = topDisclaimer+0.9;
	topAdvisorSignature = topRecipientSignature;
	
	groupInfoLabels = ["Group Number","Project Name","Advisor","Group Leader","Leader Email"];
	groupInfoValues = [orderInfo.groupNumber, orderInfo.projectName, orderInfo.advisor, orderInfo.leaderName, orderInfo.leaderEmail];
	recipientInfoLabels = ["Recipient Name","Recipient Email","Recipient Phone#"];
	recipientInfoValues = [orderInfo.recipientName, orderInfo.recipientEmail, orderInfo.recipientPhone];

	doc = new jsPDF('p','in',[settings.height,settings.width]);
	doc.addFont("Calibri","Calibri","normal");
	doc.setFont("Helvetica");
	doc.setFontStyle("normal");
	
	//Title
	doc.setFontSize(14);
	doc.centeredText("RUTGERS MAE 467: DESIGN AND MANUFACTURING I",settings.tmargin+0.5);
	
	//Scarlet Band
	doc.setFillColor(204,0,51);
	doc.rect(settings.lmargin,settings.tmargin+0.6,settings.width-settings.lmargin-settings.rmargin,0.3,"F");
	doc.setFontSize(11);
	doc.setTextColor(255);
	doc.centeredText("Fall 2016 Senior Design Part Order Form",settings.tmargin+0.8)
	
	//Generator
	doc.setFontSize(8);
	doc.setTextColor(0);
	date = new Date();
	doc.centeredText("Generated "+date.toUTCString()+" through the Chrome Extension.",settings.tmargin+1.2);
	doc.setFontSize(11);
	
	//Group Info
	heightGroupInfoTitle = 0.3;
	doc.setFillColor(100);
	doc.rect(leftGroupInfo,settings.tmargin+0+topGroupInfo,rightGroupInfo-leftGroupInfo,heightGroupInfoTitle,"F");
	doc.setFontSize(9);
	doc.setTextColor(255);
	doc.text("GROUP INFORMATION",leftGroupInfo+0.1,settings.tmargin+0.2+topGroupInfo);
	
	//Group Info Labels
	marginGroupInfoLabels = 0.2;
	heightGroupInfoLabels = 0.2;
	for(i=0;i<groupInfoLabels.length;i++){
		if(i%2==0){
			doc.setFillColor(220);
		}else{
			doc.setFillColor(245);
		}
		doc.rect(leftGroupInfo,settings.tmargin+heightGroupInfoLabels*(i)+heightGroupInfoTitle+topGroupInfo,rightGroupInfo-leftGroupInfo,heightGroupInfoLabels,"F");
		doc.setFontSize(9);
		doc.setTextColor(0);
		lineBottomHeight=settings.tmargin+heightGroupInfoLabels*(i)+heightGroupInfoTitle+0.15+topGroupInfo;
		doc.rightAlignedText(groupInfoLabels[i],lineBottomHeight,leftGroupInfo+settings.lmargin+marginGroupInfoLabels);
		doc.text(groupInfoValues[i],leftGroupInfo+settings.lmargin+marginGroupInfoLabels+0.1,lineBottomHeight);
	}
	
	//Recipient Info
	heightRecipientInfoTitle = 0.3;
	doc.setFillColor(100);
	doc.rect(leftRecipientInfo,settings.tmargin+0+topRecipientInfo,rightRecipientInfo-leftRecipientInfo,heightRecipientInfoTitle,"F");
	doc.setFontSize(9);
	doc.setTextColor(255);
	doc.text("RECIPIENT INFORMATION",leftRecipientInfo+0.1,settings.tmargin+0.2+topRecipientInfo);
	
	//Recipient Info Labels
	marginRecipientInfoLabels = 0.35;
	heightRecipientInfoLabels = 0.2;
	for(i=0;i<recipientInfoLabels.length;i++){
		if(i%2==0){
			doc.setFillColor(220);
		}else{
			doc.setFillColor(245);
		}
		doc.rect(leftRecipientInfo,settings.tmargin+heightRecipientInfoLabels*(i)+heightRecipientInfoTitle+topRecipientInfo,rightRecipientInfo-leftRecipientInfo,heightRecipientInfoLabels,"F");
		doc.setFontSize(9);
		doc.setTextColor(0);
		lineBottomHeight = settings.tmargin+heightRecipientInfoLabels*(i)+heightRecipientInfoTitle+0.15+topRecipientInfo;
		doc.rightAlignedText(recipientInfoLabels[i],lineBottomHeight,leftRecipientInfo+settings.lmargin+marginRecipientInfoLabels);
		doc.text(recipientInfoValues[i],leftRecipientInfo+settings.lmargin+marginRecipientInfoLabels+0.1,lineBottomHeight);
	}
	
	//Disclaimer
	disclaimerText = "By placing an order, the group members and their advisor accept and agree to the vendors' terms and conditions. Please note that prices listed are often wholesale, do not include shipping, handling fees, taxes, and/or duties, and are subject to correction or change without notice. TAs reserve the right to postpone orders that risk going over the group's budget until any issues can be sorted out. The named recipient hereby agrees to pick up any orders in a timely fashion, under penalty of having the items returned.";
	heightDisclaimer = 0.3;
	marginDisclaimer = 0.5;
	doc.setFontSize(9);
	doc.setTextColor(0);
	doc.text(doc.splitTextToSize(disclaimerText,settings.width-settings.lmargin-settings.rmargin-marginDisclaimer*2),settings.lmargin+marginDisclaimer,settings.tmargin+0.2+topDisclaimer);
	
	//Recipient Signature
	heightRecipientSignature = 1;
	marginRecipientSignature = 0.2
	doc.setFillColor(230);
	doc.rect(leftGroupInfo,settings.tmargin+0+topRecipientSignature,rightGroupInfo-leftGroupInfo+centralDividerThickness,heightRecipientSignature,"F");
	doc.setFontSize(9);
	doc.setTextColor(0);
	doc.text("Recipient Signature",settings.lmargin+marginRecipientSignature,settings.tmargin+0.2+topRecipientSignature+heightRecipientSignature-0.3);
	
	//Advisor Signature
	heightAdvisorSignature = 1;
	marginAdvisorSignature = 0.2
	bottomAdvisorSignature = topAdvisorSignature + heightAdvisorSignature;
	doc.setFillColor(230);
	doc.rect(leftRecipientInfo-centralDividerThickness,settings.tmargin+0+topAdvisorSignature,rightRecipientInfo-leftRecipientInfo+centralDividerThickness,heightAdvisorSignature,"F");
	doc.setFontSize(9);
	doc.setTextColor(0);
	doc.rightAlignedText("Advisor Signature",settings.tmargin+0.2+topAdvisorSignature+heightAdvisorSignature-0.3,settings.width-settings.rmargin-marginAdvisorSignature);
	signatureLineHeight = settings.tmargin+topAdvisorSignature+heightAdvisorSignature-0.3;
	doc.setLineWidth(0.01);
	doc.line(leftGroupInfo+0.1,signatureLineHeight,rightGroupInfo-0.1,signatureLineHeight);
	doc.line(leftRecipientInfo+0.1,signatureLineHeight,rightRecipientInfo-0.1,signatureLineHeight);
	
	//Divider
	// marginDivider = -2;
	// dashSizeDivider = 0.05;
	// doc.setDrawColor(0);
	// doc.setLineWidth(0.01);
	// doc.dashedLine(settings.lmargin+marginDivider, settings.tmargin+bottomAdvisorSignature+0.2, settings.width-settings.rmargin-marginDivider, settings.tmargin+bottomAdvisorSignature+0.2,dashSizeDivider);
	
	//ITEMS LIST
	maxBottom = settings.height-settings.bmargin;
	pageCount = 1;
	topItemsList = bottomAdvisorSignature + 0.4;
	leftVendor = 0.2;
	leftSKU = 1;
	leftQuantity = 1.9;
	leftPrice = 2.5;
	leftTotal = 3.3;
	leftDescription = 4.2;
	//Items List Header, First Page
	heightListHeader = 0.3;
	heightLine = 0.2;
	heightText = 0.15;
	doc.setFillColor(100);
	doc.rect(settings.lmargin,settings.tmargin+0+topItemsList,settings.width-settings.lmargin-settings.rmargin,heightListHeader,"F");
	doc.setFontSize(9);
	doc.setTextColor(255);
	doc.text("Vendor",settings.lmargin+leftVendor,settings.tmargin+0.2+topItemsList);
	doc.text("Item/SKU#",settings.lmargin+leftSKU,settings.tmargin+0.2+topItemsList);
	doc.text("Quantity",settings.lmargin+leftQuantity,settings.tmargin+0.2+topItemsList);
	doc.text("Unit Price",settings.lmargin+leftPrice,settings.tmargin+0.2+topItemsList);
	doc.text("Item Total",settings.lmargin+leftTotal,settings.tmargin+0.2+topItemsList);
	doc.text("Short Description",settings.lmargin+leftDescription,settings.tmargin+0.2+topItemsList);
	topItemsList += heightListHeader;
	
	//Admin Use Footer, First Page
	insertFooter = function(){	
		dashSizeAdminUse = 0.05;
		marginAdminUseLine = 0.2;
		textLineBottom = settings.height-settings.bmargin+heightLine+0.2;
		doc.setLineWidth(0.01);
		doc.dashedLine(settings.lmargin+marginAdminUseLine,settings.height-settings.bmargin+0.2,settings.width-settings.rmargin-marginAdminUseLine,settings.height-settings.bmargin+0.2,dashSizeAdminUse)
		doc.setTextColor(150);
		doc.setFillColor(255);
		centerRectHeight = 0.2;
		centerRectWidth = 1.5;
		doc.rect((settings.width-centerRectWidth)/2,settings.height-settings.bmargin+0.2-centerRectHeight/2,centerRectWidth,centerRectHeight,"F");
		doc.centeredText("Official Use Only",settings.height-settings.bmargin+0.2+heightText/4);
		if(orderInfo.Urgent){
			doc.setTextColor(255);
			doc.setFillColor(125,0,0);
			doc.rect(settings.lmargin,settings.height-settings.bmargin+0.4,1,0.5,"F");
			doc.text("URGENT",settings.lmargin+0.25,settings.height-settings.bmargin+0.7);
		}
		if(pageCount==1){
			doc.setTextColor(0);
			doc.setLineWidth(0.01);
			doc.rect(settings.lmargin+1.05,settings.height-settings.bmargin+0.4,1,0.5,"D");
			doc.text("Sub",settings.lmargin+1.1,settings.height-settings.bmargin+0.7);
			doc.setLineWidth(0.01);
			doc.rect(settings.lmargin+2.1,settings.height-settings.bmargin+0.4,1,0.5,"D");
			doc.text("Ord",settings.lmargin+2.15,settings.height-settings.bmargin+0.7);
			doc.setLineWidth(0.01);
			doc.rect(settings.lmargin+3.15,settings.height-settings.bmargin+0.4,1,0.5,"D");
			doc.text("P/S",settings.lmargin+3.2,settings.height-settings.bmargin+0.7);
			doc.setLineWidth(0.01);
			doc.rect(settings.lmargin+4.2,settings.height-settings.bmargin+0.4,1,0.5,"D");
			doc.text("Void",settings.lmargin+4.25,settings.height-settings.bmargin+0.7);
			doc.setFontSize(14);
			doc.setTextColor(100,0,0);
			doc.text("Order Total:",settings.lmargin+5.5,settings.height-settings.bmargin+0.575)
			doc.text("$"+getTotal(),settings.lmargin+5.5,settings.height-settings.bmargin+0.825)
			doc.setFontSize(9);
			doc.setTextColor(0);
		}else{
			doc.setFontSize(8);
			doc.setTextColor(0);
			doc.text("B",settings.lmargin+2,settings.height-settings.bmargin+0.7);
			doc.text("C",settings.lmargin+3.25,settings.height-settings.bmargin+0.7);
			doc.text("D",settings.lmargin+4.5,settings.height-settings.bmargin+0.7);
			doc.text("VOID",settings.lmargin+5.75,settings.height-settings.bmargin+0.7);
		}
	};
	insertFooter();
	
	
	//Items List Lines
	for(i=0;i<parts.length;i++){
		item = parts[i];
		Log("Part "+i+" ("+(i+1)+" of "+(parts.length)+"): "+item.Description);
		
		Log("    Determining description height for Part "+i+".");
		description = (item.Description!="")?item.Description:"No Description";
		splitLine = doc.splitTextToSize(description,settings.width-settings.rmargin-settings.lmargin-leftDescription-0.2);
		minTextHeight = heightText*(splitLine.length-1);
		minHeight = heightLine + minTextHeight;
		
		Log("    Determining if page spills over because of Part "+i+".");
		Log("        Part "+i+" starts at "+(topItemsList+settings.tmargin).toFixed(2)+" and will take up approx "+minHeight.toFixed(2)+"in, thus ending at "+(settings.tmargin+topItemsList+minHeight).toFixed(2)+".");
		Log("        Footer starts at "+maxBottom.toFixed(2)+".");
		//Pagebreak if we're going to go over the bottom
		if((settings.tmargin+topItemsList+minHeight)>maxBottom){
			Log("        Part "+i+" exceeds page height. Creating new page.");
			doc.addPage();
			pageCount++;
			topItemsList = heightLine;
			
			Log("            Creating new header above box for Part "+i+".");
			//Page Header, Subsequent Pages
			Log("                Determining header text above Part "+i+".");
			headerTextLeft = (new Date()).toUTCString();
			headerTextCenter = " ";
			headerTextRight = [orderInfo.groupNumber,orderInfo.leaderNetID,orderInfo.recipientNetID,parts.length,getTotal(),"p"+pageCount].join("/");
			doc.text(headerTextLeft,settings.lmargin,settings.tmargin+topItemsList-heightText);
			doc.centeredText(headerTextCenter, settings.tmargin+topItemsList-heightText);
			doc.rightAlignedText(headerTextRight,settings.tmargin+topItemsList-heightText,settings.width-settings.rmargin);
			//Items List Header, Subsequent Pages
			doc.setFillColor(100);
			doc.rect(settings.lmargin,settings.tmargin+0+topItemsList,settings.width-settings.lmargin-settings.rmargin,heightListHeader,"F");
			doc.setFontSize(9);
			doc.setTextColor(255);
			doc.text("Vendor",settings.lmargin+leftVendor,settings.tmargin+0.2+topItemsList);
			doc.text("Item/SKU#",settings.lmargin+leftSKU,settings.tmargin+0.2+topItemsList);
			doc.text("Quantity",settings.lmargin+leftQuantity,settings.tmargin+0.2+topItemsList);
			doc.text("Unit Price",settings.lmargin+leftPrice,settings.tmargin+0.2+topItemsList);
			doc.text("Item Total",settings.lmargin+leftTotal,settings.tmargin+0.2+topItemsList);
			doc.text("Short Description",settings.lmargin+leftDescription,settings.tmargin+0.2+topItemsList);
			topItemsList += heightListHeader;
			//Admin Use Footer, Subsequent Pages
			insertFooter();
		}
		
		Log("    Determining bgColor for Part "+i+".");
		if(i%2==0){
			doc.setFillColor(210);
		}else{
			doc.setFillColor(250);
		}
		Log("    Drawing bg for Part "+i+".");
		doc.setTextColor(0);
		doc.setFontSize(8);
		doc.rect(settings.lmargin,settings.tmargin+0+topItemsList,settings.width-settings.lmargin-settings.rmargin,minHeight,"F");
		Log("    Determining y positions for Part "+i+".");
		rowTop = settings.tmargin+topItemsList;
		textFirstLineBottom = rowTop+heightLine/2+heightText/3;
		/*
		doc.setFillColor(250,0,0);
		doc.rect(settings.lmargin,rowTop,settings.width-settings.lmargin-settings.rmargin,heightLine,"F");
		doc.setFillColor(150,0,0);
		doc.rect(settings.lmargin,textFirstLineBottom,settings.width-settings.lmargin-settings.rmargin,heightText,"F");
		*/
		Log("    Writing text for Part "+i+".");
		doc.text(item.Vendor,settings.lmargin+leftVendor,textFirstLineBottom);
		doc.text(item.SKU,settings.lmargin+leftSKU,textFirstLineBottom);
		doc.text(""+Math.floor(parseFloat(item.Quantity)),settings.lmargin+leftQuantity,textFirstLineBottom);
		doc.text("$"+parseFloat(item.Price).toFixed(2),settings.lmargin+leftPrice,textFirstLineBottom);
		doc.text("$"+(parseFloat(item.Price)*parseFloat(item.Quantity)).toFixed(2),settings.lmargin+leftTotal,textFirstLineBottom);
		doc.text(splitLine,settings.lmargin+leftDescription,textFirstLineBottom);
		
		Log("    Determining bottom position for Part "+i+".");
		topItemsList += minHeight;
		
		Log("    Finished processing Part "+i+". Moving to next item.");
	};
	
	//doc.output("dataurlnewwindow");
	doc.save(""+orderInfo.groupNumber +"_"+ Math.floor(Date.now()/100/60/60/24) +".pdf")
};