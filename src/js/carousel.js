var verticalCarousel = (function () {

	var DIV = document.createElement("DIV");
	var A = document.createElement("A");
	var CLASS_NAME_PREFIX = "v-carousel";
	var ITEM_HEIGHT = 75;
	var ITEM_MARGIN = 8;
	var CONTAINER_BORDER = 1;
	var ITEM_OUTER_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN;

	function assert(predicate, message) {
		if (predicate) {
			throw(message);
		}
	}

	function clone(node) {
		return node.cloneNode(true);
	};

	function Carousel(options) {
		this.options = options;
		this.init();
	}

	Carousel.prototype.init = function init() {
		this.element = document.querySelector(this.options.selector);
		this.itemsContainer = this.element.querySelector('.' + CLASS_NAME_PREFIX + '--items-list');

		var height = this.options.visibleItems * (ITEM_OUTER_HEIGHT) + CONTAINER_BORDER * 2;
		this.element.style.height = height + "px";

		this.cloneElements();
		this.appendControls();

		this.addEventListeners();
	}

	Carousel.prototype.cloneElements = function() {
		var container = clone(this.itemsContainer);
		var visibleItems = this.options.visibleItems;
		var items = [].slice.call(container.children);
		var first = items.slice(0, visibleItems).map(clone);
		var last = items.slice(items.length - visibleItems).map(clone);

		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		var nodeList = last.concat(items, first);
		nodeList.forEach(container.appendChild.bind(container));

		this.element.replaceChild(container, this.itemsContainer);
		this.itemsContainer = container; // update reference to container element

		// set base position
		var basePosition = -visibleItems * (ITEM_OUTER_HEIGHT);
		this.itemsContainer.style.transform = "translate3d(0px, " + basePosition + "px, 0px)";
		this.itemsContainer.style.webkitTransform = "translate3d(0px, " + basePosition + "px, 0px)";
	};

	Carousel.prototype.appendControls = function() {
		this.element.appendChild(this.createControls());
	};

	Carousel.prototype.createControls = function createControls() {
		this.controlsContainer = DIV.cloneNode();
		var dirContainer = DIV.cloneNode();
		var prev = A.cloneNode();
		var next = A.cloneNode();

		this.controlsContainer.className = CLASS_NAME_PREFIX + "--controls";
		dirContainer.className = CLASS_NAME_PREFIX + "--direction-controls";
		prev.className = CLASS_NAME_PREFIX + "--direction-left";
		next.className = CLASS_NAME_PREFIX + "--direction-right";

		prev.textContent = "<";
		next.textContent = ">";

		prev.rel = "prev";
		next.rel = "next";

		dirContainer.appendChild(prev);
		dirContainer.appendChild(next);
		this.controlsContainer.appendChild(dirContainer);

		return this.controlsContainer;
	}

	Carousel.prototype.clickHandler = function clickHandler(e) {
		var offset = ITEM_OUTER_HEIGHT,
			visibleItems = this.options.visibleItems,
			itemsContainer = this.itemsContainer,
			listHeight = itemsContainer.offsetHeight,
			cssText = itemsContainer.style.cssText,
			currentOffset = parseInt(cssText.substring(cssText.indexOf(',') + 2, cssText.lastIndexOf(',') - 2), 10) || 0,
			bottomPosition = offset * visibleItems - listHeight - ITEM_MARGIN,
			nextOffset;

		function updateSliderOffset(nextOffset) {
			itemsContainer.style.transform = "translate3d(0px, " + nextOffset + "px, 0px)";
			itemsContainer.style.webkitTransform = "translate3d(0px, " + nextOffset + "px, 0px)";
		}

		function updateTransitionDuration(duration) {
			itemsContainer.style.transitionDuration = duration;
		}

		function loop(nextOffset, cb) {
			updateTransitionDuration("0s");
			updateSliderOffset(nextOffset);
			setTimeout(function() {
				cb(nextOffset);
			}, 1);
		}

		function next(nextOffset, cb) {
			if (nextOffset < bottomPosition) {
				loop(-offset * visibleItems, function(nextOffset) {
					next(nextOffset - offset);
				});
			} else {
				updateTransitionDuration("0.5s");
				updateSliderOffset(nextOffset);
			}
		}

		function previous(nextOffset) {
			if (nextOffset > 0) { // loop around
				loop(bottomPosition + offset * 2, function(nextOffset) {
					previous(nextOffset + offset);
				});
			} else {
				updateTransitionDuration("0.5s");
				updateSliderOffset(nextOffset);
			}
		}

		switch (e.target.rel) {
			case 'next':
				next(currentOffset - offset);
				break;
			case 'prev':
				previous(currentOffset + offset);
				break;
		}
	};

	Carousel.prototype.addEventListeners = function addEventListeners() {
		this.controlsContainer.addEventListener("click", this.clickHandler.bind(this));
	};

	return function(options) {

		assert(!options, "Missing options hash");
		assert(!options.selector, "Missing selector-property in options hash");

		var instance = new Carousel(options);
		return instance;
	};

})();

