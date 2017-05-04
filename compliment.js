/* global Log, Module, moment */

/* Magic Mirror
 * Module: Compliments - iss location
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * By Xinru Hu
 *
 * MIT Licensed.
 */
Module.register("compliments", {

	// Module config defaults.
	defaults: {
		updateInterval: 5000,
		remoteFile: null,
		animationSpeed: 1000,
		initialLoadDelay: 0, // 0 seconds delay
		fadeSpeed: 4000
	},

		// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

		// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.scheduleUpdate(this.config.initialLoadDelay);

		this.isslocationlat = null
		this.isslocationlong = null
		this.isstimestamp = null

		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	/* updateLocation(compliments)
	 * Requests new data from isslocation.com.
	 * Calls processLocation on succesfull response.
	 */
	updateLocation: function() {

		var url = "http://api.open-notify.org/iss-now.json"
		var self = this;

		var locationRequest = new XMLHttpRequest();
		locationRequest.open("GET", url, true);
		locationRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processLocation(JSON.parse(this.response));
				} else {
					Log.error(self.name + ": Could not load location data.");
				}
			}
		};
		locationRequest.send();
	},

	/* processLocation(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - location information received form iss location api.
	 */
	processLocation: function(data) {

		if (!data || !data.main || typeof data.main.temp === "undefined") {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			return;
		}

		this.isslocationlat = parseFloat(data.iss_position.latitude)
		this.isslocationlong = parseFloat(data.iss_position.longitude)
		//this.isstimestamp = parseFloat(data.timestamp)

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var small = document.createElement("div");
		small.className = "thin xlarge bright";

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		small.appendChild(spacer);
		
		var isslatitude = document.createElement("span");
		isslatitude.innerHTML = this.isslocationlat;

		var isslongitude = document.createElement("span");
		isslongitude.innerHTML = this.isslocationlong;

		small.appendChild(isslatitude)
		small.appendChild(spacer)
		small.appendChild(isslongitude)

		wrapper.appendChild(small);
		return wrapper;
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateLocation();
		}, nextLoad);
	},

});