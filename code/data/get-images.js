(function() {
	function saveImage(elt, fname) {
		var imgCanvas = document.createElement("canvas"),
		imgContext = imgCanvas.getContext("2d");
 	 	 
		imgCanvas.width = elt.naturalWidth;
		imgCanvas.height = elt.naturalHeight;
		imgContext.drawImage(elt, 0, 0, elt.naturalWidth, elt.naturalHeight);
 	 	 
		self.port.emit("SaveImage", [fname, imgCanvas.toDataURL("image/png")]);
	}

	var query = '&'+window.location.search.substring(1)+'&';
	var seq_match = /&SequenceNumber=([0-9]+)&/.exec(query);
	var ckno_match = /&CheckNumber=([0-9]+)&/.exec(query);
	var depno_match = /&DepositSlipNumber=/.exec(query);
	var date_match = /&Date=([0-9]+)&/.exec(query);
	var id_match = /&Id=([-0-9a-fA-F]+)&/.exec(query);
	var seq, date, ckno;

	function tryFrontImage() {
		var frontImageElt = document.getElementById('CheckFrontImage');
		if (frontImageElt && frontImageElt.complete) {
			saveImage(frontImageElt, date + '_check_' + ckno + '_' + seq);
			document.getElementById("Return").click();
		} else {
			setTimeout(tryFrontImage, 200);
		}
	}

	if (seq_match && date_match && ckno_match) {
		seq = seq_match[1];
		date = date_match[1];
		ckno = ckno_match[1];
		tryFrontImage();
	} else if (seq_match && date_match && depno_match) {
		seq = seq_match[1];
		date = date_match[1];

		var clickedLinks = {};
		var savedImages = {};
		var returnLink = document.getElementById('ReturnLink');
		if (returnLink) {
			function checkForImage(n) {
				var frontimages = document.getElementsByName('CheckFrontImage');
				for (var i = frontimages.length - 1; i >= 0; --i) {
					var image = frontimages[i];
					if (image.complete && !savedImages[image.id]) {
						savedImages[image.id] = 1;
						saveImage(image, date + '_deposit_' + n + '_' + seq);
						clickNextLink();
						return;
					}
				}
				setTimeout(function() { checkForImage(n); }, 100);
			}

			function clickNextLink() {
				var depositDetailsTbl = document.getElementById('DepositDetailsList');
				if (!depositDetailsTbl) {
					self.port.emit("AddDepositToIgnore", seq);
				} else {
					var links = depositDetailsTbl.getElementsByTagName('a');
					for (var i = links.length - 1; i >= 0; --i) {
						var link = links[i];
						if (link.innerHTML.trim() === "See" && !clickedLinks[link.id]) {
							clickedLinks[link.id] = 1;
							link.click();
							setTimeout(function() { checkForImage(i); }, 100);
							return;
						}
					}
				}
				returnLink.click();
			}

			clickNextLink();
		}
	} else if (id_match) {
		seq = '';

		function twodigit(s) {
			return (s.length >= 2) ? s : '0' + s;
		}

		var ckNoElt = document.getElementById("CheckNumber");
		var dtElt = document.getElementById("PostDate");
		if (ckNoElt && dtElt) {
			var ckno_match = /^\s*Check Number:\s+(\d+)\s*$/.exec(ckNoElt.textContent);
			var dt_match = /^\s*(\d+)\/(\d+)\/(\d+)\s*$/.exec(dtElt.textContent);
			if (ckno_match && dt_match) {
				ckno = ckno_match[1];
				date = dt_match[3] + twodigit(dt_match[1]) + twodigit(dt_match[2]);
				tryFrontImage();
			}
		}
	}
})();
