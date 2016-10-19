console.log("Started background process.");

Parts = [];
return_response = [];
/*Settings = {groupNumber:"Q1",
			projectName:"Project",
			advisor:"Pelegri",
			leaderNetID:"xyz123",
			leaderName:"Leader",
			leaderEmail:"leader@rutgers.edu",
			recipientNetID:"xyz124",
			recipientName:"Recipient",
			recipientEmail:"recipient@rutgers.edu",
			recipientPhone:"(555)123-4567"
			};/**/
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
};
function clearData(){
	localStorage.removeItem(storageKey);
	localStorage.removeItem(storageKeySettings);
	console.log("Cleared data.");
};

loadData();

// Contect Menus
chrome.contextMenus.removeAll();
bypassAddItemMenu = chrome.contextMenus.create({
	title:"Open Parts List in New Tab",
	contexts:["browser_action"],
	onclick: function(){
		bypassAddItem = true;
		chrome.tabs.create({url:"popup.html"});
	}
});

//MESSAGING
function processResponseFromContent(response){
	return_response = [];
	if(response.type=="INT_ADD"){
		console.log("BG Received");
		console.log(response)
		if(response.content){
			console.log("Content was not undefined.");
			parsed_content = JSON.parse(response.content);
			console.log("Parsed content ");
			console.log(parsed_content);
			if(Array.isArray(parsed_content)){
				for(array_index=0;array_index<parsed_content.length;array_index++){
					parsed_item = parsed_content[array_index];
					parsed_item.Quantity = parseFloat(parsed_item.Quantity);
					parsed_item.Price = parseFloat(parsed_item.Price).toFixed(2);
					return_response.push(parsed_item);
				}
				// return_response.push.apply(return_response,parsed_content);
			}else{
				parsed_content.Quantity = parseFloat(parsed_content.Quantity);
				parsed_content.Price = parseFloat(parsed_content.Price).toFixed(2);
				return_response.push(parsed_content);
			}
		}
	}
	chrome.runtime.sendMessage({type: "INT_ADD",content:JSON.stringify(return_response)});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.type=="INT_REQ_FROM_BG"){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: "INT_REQ_FROM_CONTENT"}, processResponseFromContent);
		});
		if(return_response && return_response.length>0){
			return_message = {"type":"INT_ADD","content":JSON.stringify(return_response)};
			console.log("Background is returning")
			console.log(return_message);
			sendResponse(return_message);
		}
	}else if(request.type=="INT_SAVE"){
		saveData();
	}else if(request.type=="INT_LOAD"){
		loadData();
	}else if(request.type=="INT_CLEAR"){
		clearData();
	}
});
