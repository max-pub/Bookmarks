chrome.app.runtime.onLaunched.addListener(function() {
	chrome.tabs.create({
		url: 'csp.html'
	});
});