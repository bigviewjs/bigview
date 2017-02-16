
var BigEvent = function() {
};

BigEvent.prototype.on = function(eventName, func) {
    this._listeners = this._listeners || {};
    this._listeners[eventName] = this._listeners[eventName] || [];
    this._listeners[eventName].push(func);
};

BigEvent.prototype.off = function(eventName, func) {
    this._listeners = this._listeners || {};
    this._listeners[eventName].splice(this._listeners[eventName].indexOf(func), 1);
};

BigEvent.prototype.trigger = function(eventName) {
    this._listeners = this._listeners || {};

    var dataArgument = arguments[1] ? arguments[1] : null;
    var events = this._listeners[eventName] || [];

    for(var i = 0; i < events.length; i++) {
        var ev = events[i]

        if(dataArgument) {
            ev.call(this, dataArgument);
        } else {
            ev.call(this);
        }
    };
};

BigEvent.extend = function(obj) {
    var functions = [
        'on',
        'off',
        'trigger'
    ];
    
    for(var i = 0; i < functions.length; i++) {
        var func = functions[i];

        if(typeof obj === 'function') {
            obj.prototype[func] = BigEvent.prototype[func];
        } else {
            obj[func] = BigEvent.prototype[func];
        }
    };
};

var Bigview = function () {
    var self = this;
    
    this.log = function(str) {
        if (this.debug === true) {
            console.log(str)
        }
    }
    // payload={domid, html='',}
    this.view = function(payload) {
        self.trigger('pageletArrive', payload);

        if(payload.domid) {
            self.trigger(payload.domid, payload);
        }
    };
    
    this.ready = function(data) {
        this.log('ready')
        self.trigger('ready', data)
    };
    
    this.end = function(data) {
        this.log('end')
        self.trigger('end', data)
    };
    
    this.error = function(payload) {
        this.log('error')
        self.trigger('error', payload)
    };

    this.on('pageletArrive', function(payload) {
        this.log(payload)
        if(payload.error) {
          self.trigger('error', payload)  
        }

        if(payload.domid && payload.html) {
            self.replaceHtml(payload.domid, payload.html);
        }
    });

    //http://blog.stevenlevithan.com/archives/faster-than-innerhtml
    this.replaceHtml = function(el, html) {
    	var oldEl = typeof el === "string" ? document.getElementById(el) : el;
    	/*@cc_on // Pure innerHTML is slightly faster in IE
    		oldEl.innerHTML = html;
    		return oldEl;
    	@*/
        if(!oldEl){
            console.log(el + ' is not exist in dom')
            return
        }
    	var newEl = oldEl.cloneNode(false);
    	newEl.innerHTML = html;
    	oldEl.parentNode.replaceChild(newEl, oldEl);
    	/* Since we just removed the old element from the DOM, return a reference
    	to the new element, which can be used to restore variable references. */
    	return newEl;
    };
};

BigEvent.extend(Bigview);

window.bigview = new Bigview();

if (typeof window.define === 'function' && window.define.amd) {
    window.define('bigview', [], function() {
        return window.bigview;
    });
}
