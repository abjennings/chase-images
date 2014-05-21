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

	if (seq_match && date_match) {
		var seq = seq_match[1];
		var date = date_match[1];

		if (ckno_match) {
			var ckno = ckno_match[1];

			function tryImages() {
				var frontImageElt = document.getElementById('CheckFrontImage');
				if (frontImageElt && frontImageElt.complete) {
					saveImage(frontImageElt, date + '_check_' + ckno + '_' + seq);
					document.getElementById("Return").click();
				} else {
					setTimeout(tryImages, 200);
				}
			}

			tryImages();
		} else if (depno_match) {

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
					returnLink.click();
				}

				clickNextLink();
			}
			
		}
	}
})();
