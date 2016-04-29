DATA = {
	all: {},
	videos: {},
	shopping: {},
	people: {},

	load: function(callback) {
		// DATA.all = {};
		// DATA.videos = {};
		chrome.bookmarks.search({}, function(list) {
			list.sort(DATA.dateSort);
			for (var i in list) {
				if (!list[i].url) continue;
				if (!list[i].dateAdded) continue;
				var item = list[i];
				item.domain = item.url.split('/')[2].replace('www.', '');
				DATA.add(item, 'all');
				if (PLUG[item.domain]) PLUG[item.domain](item);
				if (item.category) DATA.add(item, item.category);
				// else DATA.add(item, 'other');
			}
			console.log('DATA.load', list);
			if (callback) callback(list);
		});
	},
	ready: function(callback) {
		if (DATA.getMonths('all').length) callback();
		else setTimeout(function() {
			DATA.ready(callback);
		}, 100);
	},
	dateSort: function(a, b) { // desc
		if (a.dateAdded < b.dateAdded) return 1;
		if (a.dateAdded > b.dateAdded) return -1;
		return 0;
	},

	add: function(item, category) {
		var month = new Date(item.dateAdded).format('YYYY-MM');
		if (!DATA[category][month]) DATA[category][month] = [];
		DATA[category][month].push(item);
	},
	getMonths: function(category) {
		return Object.keys(DATA[category]).sort().reverse();
	},
	getMonth: function(category, month) {
		return DATA[category][month];
	}
}

function parseURL(url) {
	var parser = document.createElement('a'),
		searchObject = {},
		queries, split, i;
	// Let the browser do the work
	parser.href = url;
	// Convert query string to object
	queries = parser.search.replace(/^\?/, '').split('&');
	for (i = 0; i < queries.length; i++) {
		split = queries[i].split('=');
		searchObject[split[0]] = split[1];
	}
	return {
		protocol: parser.protocol,
		host: parser.host,
		// hostname: parser.hostname,
		port: parser.port,
		path: parser.pathname,
		queryString: parser.search,
		query: searchObject,
		hash: parser.hash
	};
}

PLUG = {
	'youtube.com': function(item) {
		if (item.url.indexOf('youtube.com/watch') == -1) return false;
		var url = parseURL(item.url);
		item.videoID = url.query.v;
		item.image = 'https://i.ytimg.com/vi/' + item.videoID + '/mqdefault.jpg';
		item.title = item.title.split('-')[0];
		item.category = 'videos';
		// console.log('video', new Date(item.dateAdded), item.videoID);
	},
	'amazon.de': function(item) {
		var url = parseURL(item.url);
		// console.log('amazon', item.url);
		// return;
		var ASIN = url.path.match(/p\/([0-9A-Z]+)/);
		if (ASIN) item.ASIN = ASIN[1];
		item.title = item.title.split(':')[0];
		item.category = 'shopping';
		item.image = 'http://images.amazon.com/images/P/' + item.ASIN + '.01.MZZZZZZZ.jpg';
		// console.log('amazon', item.ASIN, item.image);
		// console.log(parseURL(item.url));
	},
	'facebook.com': function(item) {
		var url = parseURL(item.url);
		if (url.path.substr(-4) == '.php') return;
		item.category = 'people';
		item.name = url.path.split('/')[1];
		item.image = 'https://graph.facebook.com/' + item.name + '/picture?width=128&height=128';
		// JSON.parse(document.querySelectorAll('[data-gt]')[0].getAttribute('data-gt')).profile_owner
		// console.log('facebook', url.path, item.name);
	},


}
DATA.load();



// amazon: function(item){
//     if(item.url.indexOf('http://www.amazon.')==-1) return false;
//     if( (item.url.indexOf('/dp/')==-1) && (item.url.indexOf('/gp/')==-1) ) return false;

//     if(item.url.indexOf('/s/')!=-1) return false;
//     if(item.url.indexOf('/wishlist/')!=-1) return false;
//     if(item.url.indexOf('/main/')!=-1) return false;
//     if(item.url.indexOf('view.html')!=-1) return false;
//     if(item.url.indexOf('feature.html')!=-1) return false;
//     if(item.url.indexOf('display.html')!=-1) return false;
//     if(item.url.indexOf('/details/')!=-1) return false;
//     if(item.url.indexOf('/search')!=-1) return false;
//     var url = item.url.split("/ref=")[0].trim('/');
//     if(url.split('/').length<4) return false;
//     if(url.substr(-1)=='/') url = url.substr(0,url.length-1);
//     var asin = url.split('/').slice(-1)[0];
//     // if(!asin) console.log('amazon:', asin, url, item.url);
//     // else console.log('.');
//     // console.log('amazon:', asin, url);
//     // console.log('---', item.title);
//     return {ID:asin, title:item.title, url:item.url, time:item.time};
//     // http://images.amazon.com/images/P/B00NHKF64K.01.MZZZZZZZ.jpg
//     // http://images.amazon.com/images/P/B00NHKF64K.01.LZZZZZZZ.jpg
// }

// var name = item.url.split('youtube.com/watch?v=')[1];
// name = name.split('?')[0];
// name = name.split('#')[0];
// name = name.split('&')[0];


// var regex = new RegExp('^' + this.regex + '$');
// var match = list[i].url.match(regex);
// var month = new Date(list[i].dateAdded).format('YYYY-MM');
// if (!DATA.months[month]) DATA.months[month] = [];
// DATA.months[month].push(list[i]);