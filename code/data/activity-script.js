(function() {
	var itemJSRE = /^javascript:DoPostBackFor[A-Za-z]+\('[^']+','[^']+','[^']+','[^']+','(\d+)','[^']+','[^']+','[^']+','[^']+','[^']+'\)$/;
	var cknoRE = /^\s*CHECK\s+#\s+(\d+)(\s+\d+\/\d+)?\s*$/;

	self.port.on('AllDownloaded', function() {
		alert("All images on this page have been downloaded.");
	});

	function forAllItemLinks(callback) {
		var transTable = document.getElementById('DDATransactionDetails_DDAPrepaidTrnxDetailsGrid');
		if (!transTable) {
			return false;
		}
		var links = transTable.getElementsByTagName('a');
		for (var i = links.length - 1; i >= 0; --i) {
			var link = links[i];
			if (link.textContent.trim() === "(view)") {
				var itemMatch = itemJSRE.exec(link.href);
				if (itemMatch) {
					callback(itemMatch[1], link);
				} else {
					console.error("Unrecognized (view) link: " + link.href);
				}
			} else {
				var cknoMatch = cknoRE.exec(link.textContent);
				if (cknoMatch) {
					callback('ck' + cknoMatch[1], link);
				}
			}
		}
		return true;
	}

	self.port.on('Goto', function(target_id) {
		forAllItemLinks(function(id, link) {
			if (id === target_id) {
				link.click();
			}
		});
	});

	function checkLinks() {
		var items = [];
		var foundTable = forAllItemLinks(function(id, link) { items.push(id); });
		if (foundTable) {
			self.port.emit('ItemList', items);
		}
	}

	if (document.readyState == "interactive" || document.readyState == "complete") {
		checkLinks();
	} else {
		window.addEventListener('load', checkLinks);
	}
})();
