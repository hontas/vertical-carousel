/* global rss, verticalCarousel, rssSlider */
window.addEventListener("DOMContentLoaded", function domLoaded() {
	"use strict";

	rss({
		url: "http://www.aftonbladet.se/rss.xml",
		selector: "#carousel_one",
		limit: 10
	})
	.then(function() {
		verticalCarousel({
			selector: "#carousel_one",
			transitionDuration: 250
		});
	});

	rss({
		url: "http://www.aftonbladet.se/kultur/rss.xml",
		selector: "#carousel_two",
		limit: 3
	}).then(function() {
		verticalCarousel({
			selector: "#carousel_two",
			visibleItems: 3
		});
	});

	// rssSlider({
	// 	feedUrl: "http://aftonbladet.se/rss.xml",
	// 	selector: "#carousel_three"
	// });
});
