var rss = (function () {
	var ARTICLE = document.createElement("ARTICLE");
	var IMG = document.createElement("IMG");
	var DIV = document.createElement("DIV");
	var H2 = document.createElement("H2");
	var UL = document.createElement("UL");
	var LI = document.createElement("LI");
	var A = document.createElement("A");
	var P = document.createElement("P");

	var CLASS_NAME_PREFIX = "v-carousel";

	function assert(predicate, message) {
		if (predicate) {
			throw new Error(message);
		}
	}

	function getImgSrcFrom(string) {
		var regex = /src=\"([^"]+)"/i;
		var match = string.match(regex);
		return match && match[1];
	}

	var API = {
		init: function() {
			return this.loadFeed()
				.then(this.getItems.bind(this))
				.then(this.createElements.bind(this))
				.then(this.appendToDom.bind(this))
				.catch(console.warn.bind(console));
		},

		loadFeed: function() {
			var url = this.options.url;
			var limit = this.options.limit || 10;

			return new Promise(function(resolve, reject) {
				var feed = new google.feeds.Feed(url);
				feed.setNumEntries(limit);
				feed.load(resolve);
			});
		},

		getItems: function(result) {
			if (!result.error) {
				return result.feed.entries;
			} else {
				throw new Error(result.error);
			}
		},

		createElements: function(items) {
			var fragment = document.createDocumentFragment();
			var itemsContainer = UL.cloneNode();

			items
				.map(this.createElement)
				.forEach(function(element) {
					itemsContainer.appendChild(element);
				});

			itemsContainer.classList.add(CLASS_NAME_PREFIX + "--items-list");
			fragment.appendChild(itemsContainer);

			return fragment;
		},

		createElement: function(item) {
			var listItem = LI.cloneNode();
			var article = ARTICLE.cloneNode();
			var link = A.cloneNode();
			var imgContainer = DIV.cloneNode();
			var itemBody = DIV.cloneNode();
			var image = IMG.cloneNode();
			var title = H2.cloneNode();
			var paragraph = P.cloneNode();

			link.setAttribute('href', item.link);
			listItem.classList.add(CLASS_NAME_PREFIX + "--item");
			itemBody.classList.add(CLASS_NAME_PREFIX + "--body");
			imgContainer.classList.add(CLASS_NAME_PREFIX + "--img-container");

			image.src = getImgSrcFrom(item.content) || "http://placehold.it/100x75";
			title.textContent = item.title;
			paragraph.textContent = item.contentSnippet;

			listItem.appendChild(article);
			article.appendChild(link);
			link.appendChild(imgContainer);
			imgContainer.appendChild(image);
			link.appendChild(itemBody);
			itemBody.appendChild(title);

			itemBody.appendChild(paragraph);

			return listItem;
		},

		appendToDom: function(fragment) {
			var target = document.querySelector(this.options.selector);
			target.classList.add(CLASS_NAME_PREFIX + '--container');
			target.appendChild(fragment);
			return fragment;
		}
	};

	assert(!window.google || !window.google.load, "Dependancy google jsapi missing");

	var googleFeedApiPromise = new Promise(function(resolve) {
		google.load("feeds", "1");
		google.setOnLoadCallback(resolve);
	});

	return function(options) {

		assert(!options, "Missing options hash");
		assert(!options.url, "Missing url-property in options hash");
		assert(!options.selector, "Missing selector-property in options hash");

		return googleFeedApiPromise.then(function() {
			var instance = Object.create(API);
			instance.options = options;
			return instance.init();
		});
	};

})();
