window.verticalCarousel = (function verticalCarousel() {
	"use strict";

	var DIV = document.createElement("DIV");
	var A = document.createElement("A");
	var CLASS_NAME_PREFIX = "v-carousel";
	var ITEM_HEIGHT = 75;
	var ITEM_MARGIN = 8;
	var CONTAINER_BORDER = 1;
	var ITEM_OUTER_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN;
	var TRANSITION_DURATION = 500;

	function assert(predicate, message) {
		if (predicate) {
			throw new Error(message);
		}
	}

	function clone(node) {
		return node.cloneNode(true);
	}

	function Carousel(options) {
		this.options = options;
		this.init();
	}

	Carousel.prototype.init = function init() {
		this.element = document.querySelector(this.options.selector);
		this.itemsContainer = this.element.querySelector("." + CLASS_NAME_PREFIX + "--items-list");

		var height = this.options.visibleItems * ITEM_OUTER_HEIGHT + (CONTAINER_BORDER * 2);
		this.element.style.height = height + "px";

		this.cloneElements();
		this.appendControls();

		this.addEventListeners();
	};

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

	Carousel.prototype.createControls = function() {
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
	};

	Carousel.prototype.getCurrentOffset = function() {
		var transform = this.itemsContainer.style.transform;
		// get offset like so: [x, y, z]
		var currentOffset = transform.match(/([\-\d]+)px/g);
		return parseInt(currentOffset[1], 10);
	};

	Carousel.prototype.moveToPosition = function(pos) {
		this.itemsContainer.style.transform = "translate3d(0px, " + pos + "px, 0px)";
		this.itemsContainer.style.webkitTransform = "translate3d(0px, " + pos + "px, 0px)";
	};

	Carousel.prototype.clickHandler = function(e) {
		var self = this,
			carousel = this,
			visibleItems = this.options.visibleItems,
			itemsContainer = this.itemsContainer,
			listHeight = itemsContainer.offsetHeight,
			currentOffset = this.getCurrentOffset(),
			bottomPosition = ITEM_OUTER_HEIGHT * visibleItems - listHeight - ITEM_MARGIN;

		if (carousel.inTransition) {
			return;
		}

		switch (e.target.rel) {
			case "next":
				next(currentOffset - ITEM_OUTER_HEIGHT);
				break;
			case "prev":
				previous(currentOffset + ITEM_OUTER_HEIGHT);
				break;
		}


		function next(nextOffset) {
			self.moveToPosition(nextOffset);
			if (nextOffset - ITEM_OUTER_HEIGHT < bottomPosition) {
				loop(-ITEM_OUTER_HEIGHT * visibleItems);
			}
		}

		function previous(nextOffset) {
			self.moveToPosition(nextOffset);
			if (currentOffset + ITEM_OUTER_HEIGHT * 2 > 0) {
				loop(bottomPosition + ITEM_OUTER_HEIGHT * visibleItems);
			}
		}

		function setTransitionDuration(duration) {
			itemsContainer.style.transitionDuration = duration + "ms";
			itemsContainer.style.webkitTransitionDuration = duration + "ms";
		}

		function loop(nextOffset) {
			carousel.inTransition = true;

			setTimeout(function() {
				setTransitionDuration(0);
				self.moveToPosition(nextOffset);
				setTimeout(function() {
					carousel.inTransition = false;
					setTransitionDuration(TRANSITION_DURATION);
				}, 1);
			}, TRANSITION_DURATION + 100);
		}
	};

	Carousel.prototype.handleTouchEvents = function(startEvt) {
		var self = this;
		var startY = startEvt.changedTouches[0].pageY;
		var currentOffset = self.getCurrentOffset();

		function getNextPos(evt) {
			var currY = evt.changedTouches[0].pageY;
			var delta = startY - currY;
			return currentOffset - delta;
		}

		function handleMove(currEvt) {
			currEvt.preventDefault();
			self.moveToPosition(getNextPos(currEvt));
		}

		this.element.addEventListener("touchmove", handleMove);

		this.element.addEventListener("touchend", function handleEnd(endEvt) {
			var nextOffset = getNextPos(endEvt);
			var nextPosition = Math.round(nextOffset / ITEM_OUTER_HEIGHT) * ITEM_OUTER_HEIGHT;

			self.moveToPosition(nextPosition);

			this.removeEventListener("touchmove", handleMove);
			this.removeEventListener("touchend", handleEnd);
		});
	};

	Carousel.prototype.addEventListeners = function addEventListeners() {
		this.controlsContainer.addEventListener("click", this.clickHandler.bind(this));
		this.element.addEventListener("touchstart", this.handleTouchEvents.bind(this));
	};

	return function(options) {

		assert(!options, "Missing options hash");
		assert(!options.selector, "Missing selector-property in options hash");

		var instance = new Carousel(options);
		return instance;
	};

})();

