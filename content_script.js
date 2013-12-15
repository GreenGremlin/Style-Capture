
var page = {
	version : "1.0.0",
	idSeed : 1,
};

function copyRecurse(element) {
	var result = [];
	var nodeType = element.prop("nodeType");
	if (nodeType == 1) {
		var idName = "SC" + (++page.idSeed);
		result.push({"id": idName, "computed": element.getFinalStyles()});
		element.contents().each(function(index) {
			result = result.concat(copyRecurse($(this)));
		});
		element.removeAttr('class');
		element.removeAttr('style');
		element.prop('id', idName);
		if (element.attr('src')) {
			element.attr('src', element.get(0).src);
		}
	}
	return result;
}

function copySingled(element) {
	element.children().remove();
	// it.empty(); this will remove all sub element including text
	var idName = "SC" + (++page.idSeed);
	var result = [{"id": idName, "computed": element.getFinalStyles()}];
	element.removeAttr('class');
	element.removeAttr('style');
	element.prop('id', idName);
	if (element.attr('src')) {
		element.attr('src', element.get(0).src);
	}
	return result;
}

function copyHTMLandCSS(element, recurse) {
	var hs = {};
	var cloned = element.clone();
	element.after(cloned);
	if (recurse) {
		hs.rule = copyRecurse(cloned);
	} else {
		hs.rule = copySingled(cloned);
	}
	hs.html = cloned.prop('outerHTML');
	cloned.remove();
	return hs;
}

function initContentScript() {
	var domOutline = DomOutline({
		onCaptured : function(element, recurse) {
			var hs = copyHTMLandCSS(element, recurse);
			hs.action = "capture";
			chrome.runtime.sendMessage(hs);
		},
		onClosed : function() {
			chrome.runtime.sendMessage({
				action : "closed"
			});
		}
	});

	chrome.runtime.onMessage
			.addListener(function(message, sender, sendResponse) {
				switch (message.action) {
				case "open":
					domOutline.start();
					sendResponse({
						count : "2"
					});
					break;
				case "close":
					domOutline.stop();
					break;
				}

			});
}

initContentScript();
