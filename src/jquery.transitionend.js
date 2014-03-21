/**
 * @author Deux Huit Huit
 * 
 * css3 Transition end
 */

(function ($, _, undefined) {
	
	"use strict"; 
	
	var transitionEndEvent = 'transitionend webkitTransitionEnd oTransitionEnd mozTransitionEnd MSTransitionEnd',
	addClassTimer = 'add-class-timer',
	queue = [],
	
	_forEachSelectorsInQueue = function (fn) { 
		if (!!queue.length) {
			$.each(queue, function eachRemoveFromQueue(index, q) {
				// check q since it may be undefined
				// when the array removes it
				if (!!q) {
					// call it
					fn.call(this, q, index);
				}
			});
		}
	};
	
	if (window.App && !!window.App.debug()) {
		$.transitionsQueue = function () {
			return queue;
		};
	}
	
	$('body').on(transitionEndEvent, function (e) {
		var target = $(e.target);
		
		_forEachSelectorsInQueue(function eachInQueue(q, index) {
			
			$.each(q.selectors, function eachCallbackSelector(selector, value) {
				q.selectors[selector] = value || target.is(selector);
			});
			
			// every selectors are on
			if (window._.every(q.selectors)) {
				// remove from queue
				queue.splice(index, 1);
				// call callback
				q.callback.call(q.context, e);
			}
		});
		//console.log('transition ended for ', e.target);
	});
	
	var isSupported = (function (b) {
		return b.style.WebkitTransition !== undefined || b.style.MozTransition !== undefined || b.style.OTransition !== undefined || b.style.transition !== undefined;
	})(document.body);
	
	$.transitionEnd = isSupported;
	
	$.fn.transitionEnd = function (callback, selectors) {
		var 
		self = $(this),
		q = {
			selectors: {},
			callback: callback,
			context: this,
			timestamp: $.now()
		};
		
		if (!isSupported) {
			setTimeout(function unsupported_transitionEnd() {
				callback.call(self, $.Event('transitionEnd'));
			}, 20);
			return self;
		}
		
		if (!!selectors && !$.isArray(selectors)) {
			selectors = [selectors];
		}
		
		if (!selectors || !selectors.length) {
			// use ourself if we can
			if (!!self.selector) {
				q.selectors[self.selector] = false;
			} else {
				if (!!App.debug()) {
					console.warn('Element %s has no selector', this);
				}
				// exit
				return self;
			}
		} else {
			$.each(selectors, function (index, value) {
				if (!!value) {
					q.selectors[value] = false;
				} else if (!!App.debug()) {
					console.warn('Element %s has no selector', index);
				}
			});
		}
		
		// add to queue
		queue.push(q);
		
		return self;
	};
	
	$.removeFromTransition = function (selectors) {
		var found = false;
		
		if (!!selectors) {
		
			if (!$.isArray(selectors)) {
				selectors = [selectors];
			}
			
			_forEachSelectorsInQueue(function eachInQueue(q, index) {
				var localFound = false;
				
				if (!!q && !!q.selectors) {
				
					localFound = window._.some(q.selectors, function eachCallbackSelector(value, selector) {
						return !!~$.inArray(selector, selectors);
					});
					
					if (localFound) {
						// remove from queue
						queue.splice(index, 1);
						
						//console.log('%s at %s have been removed from queue', selectors, index);
						
						found = true;
					}
				}
			});
		}
		
		return found;
	};
	
	
	$.fn.addClasses = function (class1, class2, callback, selectors) {
		var t = $(this);
		if (!t.length) {
			return t;
		}
		selectors = selectors || [t.selector];
		return t.each(function (index, element) {
			var t = $(element), 
			timer = t.data(addClassTimer);
			
			clearTimeout(timer);
			
			t.addClass(class1);
			
			timer = setTimeout(function addClassesTimer(class2, callback, selectors) {
				// if class1 is still present
				if (t.hasClass(class1)) {
					if ($.isFunction(callback)) {
						t.transitionEnd(callback, selectors);
					}
					t.addClass(class2);
				}
			}, 100, class2, callback, selectors);
			
			t.data(addClassTimer, timer);
		});
	};

	$.fn.removeClasses = function(class1, class2, callback, selectors) {
		var t = $(this);
		if (!t.length) {
			return t;
		}
		selectors = selectors || t.selector;
		return t.each(function (index, element) {
			var t = $(element);
			t.transitionEnd(function tEnd() {
				t.removeClass(class1);
				if ($.isFunction(callback)) {
					callback();
				}
			}, selectors);
			t.removeClass(class2);
		});
	};
	
})(jQuery, window._);