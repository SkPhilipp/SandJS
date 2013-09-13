define("sand", [], function(){

	var box_id = 0;

	/**
	 * Box constructor, sets up an empty box and registers the event handlers.
	 */
	var Box = function (){
		this.domain = null;
		this.iframe = null;
		this.boxframe = null;
		this.listeners = {};
		this.queue = [];
		this.loaded = false;
		this.box_id = box_id++;
		this.callback_id = 0;
		var reference = this;
		var handler = function(event){
			console.log(event);
			if (event.origin == reference.domain) {
				reference.handle(event.data);
			}
		};
		if (window.addEventListener) {
			window.addEventListener('message', handler, false);
		}
		else {
			window.attachEvent('onmessage', handler);
		}
	};

	/**
	 * Sets the boxframe to a window reference, can be used for example with window.parent.
	 */
	Box.prototype.set = function(domain, boxframe){
		this.domain = domain;
		this.iframe = null;
		this.loaded = false;
		this.boxframe = boxframe;
		this.sendRaw('box-loaded');
	};

	/**
	 * Loads the iframe for a given URL, this window will be the boxframe
	 */
	Box.prototype.load = function(domain, url){
		if(this.iframe == null){
			this.domain = domain;
			this.iframe = document.createElement('iframe');
			this.iframe.setAttribute('src', url);
			this.iframe.style.width = '0px';
			this.iframe.style.height = '0px';
			this.iframe.style.border = 'none';
			document.body.appendChild(this.iframe);
			this.boxframe = this.iframe.contentWindow;
			var reference = this;
			this.iframe.onload = function(){
				reference.sendRaw('box-loaded');
			};
		}
	};

	/**
	 * Reloads the iframe
	 */
	Box.prototype.reload = function(){
		this.loaded = false;
		var current = this.iframe.src;
		this.iframe.src = 'about:blank';
		this.iframe.src = current;
		this.boxframe = this.iframe.contentWindow;
	};

	/**
	 * Handles incoming messages that match the *box's domain.
	 */
	Box.prototype.handle = function (message) {
		console.log(message);
		if(this.loaded){
			var reference = this;
			// if the message starts with box-callback
			if(message.type.indexOf('box-callback') == 0){
				var receivers = this.listeners[message.data.subtype];
				var callback = function(data){
					reference.send(data.id, data);
				};
				for(var receivers_index in receivers){
					receivers[receivers_index](message.data.subdata, callback);
				}

			}
			// if the message starts with box-message
			if(message.type.indexOf('box-message') == 0){
				var receivers = this.listeners[message.data.subtype];
				for(var receivers_index in receivers){
					receivers[receivers_index](message.data.subdata);
				}
			}
		}
		else {
			this.loaded = true;
			if (message.type == 'box-loaded') {
				for (var queue_index in this.queue) {
					var item = queue[queue_index];
					this.sendRaw(item.type, item.data);
				}
				this.queue = [];
			}
		}
	};

	/**
	 * Registers a listener for a given type.
	 */
	Box.prototype.addListener = function (type, listener) {
		this.listeners[type] = this.listeners[type] || [];
		this.listeners[type].push(listener);
	};

	/**
	 * Removes one instance of a listener for a given type.
	 */
	Box.prototype.removeListener = function (type, listener) {
		this.listeners[type] = this.listeners[type] || [];
		var index = this.listeners[type].indexOf(listener);
		this.listeners.splice(index, 1);
		if(this.listeners.length == 0){
			this.removeListeners(type);
		}
	};

	/**
	 * Removes all listeners for a given type.
	 */
	Box.prototype.removeListeners = function (type) {
		delete this.listeners[type];
	};

	/**
	 * Sends a message to the boxframe.
	 *
	 * When a box is not yet loaded, messages are queued up, and dispatched when the box sends a box-loaded message.
	 */
	Box.prototype.sendRaw = function (type, data) {
		var message = {
			'type': type,
			'data': data
		};
		console.log(message);
		if(!this.loaded){
			this.queue.push(message);
		}
		else{
			this.boxframe.postMessage(message, '*');
		}
	};

	/**
	 * Generates a new callback Id
	 */
	Box.prototype.newId = function(){
		this.callback_id++;
		return "box-callback:" + this.box_id + ":" + this.callback_id;
	};

	Box.prototype.send = function(type, data){
		this.sendRaw('box-message', {
			subtype: type,
			subdata: data
		});
	};

	/**
	 * Enables the boxframe to respond directly to a message and respond in the callback.
	 */
	Box.prototype.sendCallback = function(type, data, callback, permanent) {
		var reference = this;
		var identifier = this.newId();
		this.addListener(identifier, function(data){
			if(!(permanent === true)){
				reference.removeListeners(identifier);
			}
			callback(data);
		});
		this.sendRaw('box-callback', {
			id: identifier,
			subtype: type,
			subdata: data
		});
	};

	return Box;

});
