var data = require("sdk/self").data;
var base64 = require("sdk/base64");
var fileIO = require("sdk/io/file");
var ui = require("sdk/ui");
var tabs = require("sdk/tabs");
var simplePrefs = require("sdk/simple-prefs");
var notifications = require("sdk/notifications");
var depositsToIgnore = {};
var haveChecks = {};

function SaveImage(msg) {
	var fname = msg[0];
	var imgdata = msg[1];

	if (imgdata.substring(0, 22) != "data:image/png;base64,") {
		notifications.notify({"text":"Image data not in png/base64 format."});
	} else {
		var decodedData = base64.decode(imgdata.substring(22));
		var dir = simplePrefs.prefs['directory'];
		if (!dir) {
			notifications.notify({"text":"Please specify a directory in preferences"});
		} else {
			var ByteWriter = fileIO.open(fileIO.join(dir, fname + ".png"), "wb");
			if (ByteWriter.closed) {
				notifications.notify({"text":"Can't open file"});
			} else {
				ByteWriter.write(decodedData);
				ByteWriter.close();
			}
		}
	}
}

function AddDepositToIgnore(depno)
{
	depositsToIgnore[depno] = 1;
}

function ItemList(lst) {
	var dir = simplePrefs.prefs['directory'];
	var fileList = fileIO.list(dir);
	var fileEndRE = /_([-0-9a-fA-F]+)\.png$/;
	var checkRE = /_check_(\d+)_/;
	var fileDict = {};
	for (var i = 0; i < fileList.length; ++i) {
		var fileEndMatch = fileEndRE.exec(fileList[i]);
		if (fileEndMatch) {
			fileDict[fileEndMatch[1].toLowerCase()] = 1;
		}
		var checkMatch = checkRE.exec(fileList[i]);
		if (checkMatch) {
			haveChecks['ck' + checkMatch[1]] = 1;
		}
	}
	for (i = 0; i < lst.length; ++i) {
		if (!fileDict[lst[i]] && !haveChecks[lst[i]] && !depositsToIgnore[lst[i]]) {
			activityWorker.port.emit('Goto', lst[i]);
			return;
		}
	}
	tabs.activeTab.removeListener('ready', attachToTab);
	activityWorker.port.emit('AllDownloaded');
}

var chaseActivityRE = /^https:\/\/banking\.chase\.com\/AccountActivity\/AccountDetails\.aspx\?/;
var checkImageRE = /^https:\/\/banking\.chase\.com\/Statements\/CheckImage\.aspx\?/;
var depositRE = /^https:\/\/banking\.chase\.com\/AccountActivity\/DepositDetails\.aspx\?/;
var activityWorker;

function attachToTab(tab) {
	if (chaseActivityRE.test(tab.url)) {
		activityWorker = tab.attach({ contentScriptFile: data.url("activity-script.js") });
		activityWorker.port.on('ItemList', ItemList);
		return true;
	} else if (checkImageRE.test(tab.url) || depositRE.test(tab.url)) {
		var checkWorker = tab.attach({ contentScriptFile: data.url("get-images.js") });
		checkWorker.port.on('SaveImage', SaveImage);
		checkWorker.port.on('AddDepositToIgnore', AddDepositToIgnore);
		return true;
	} else {
		return false;
	}
}

ui.ActionButton({
	id: "chase-images",
	label: "Download check images from Chase",
	icon: "./icon18.png",
	onClick: function(state) {
		if (attachToTab(tabs.activeTab)) {
			tabs.activeTab.on('ready', attachToTab);
		}
	}
});
