/*!
 * Parse JavaScript SDK
 * Version: 1.2.7
 * Built: Wed Apr 17 2013 14:48:27
 * http://parse.com
 *
 * Copyright 2013 Parse, Inc.
 * The Parse JavaScript SDK is freely distributable under the MIT license.
 *
 * Includes: Underscore.js
 * Copyright 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Released under the MIT license.
 */
(function(root) {
    root.Parse = root.Parse || {};
    root.Parse.VERSION = "js1.2.7";
}(this));
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    var push             = ArrayProto.push,
	slice            = ArrayProto.slice,
	concat           = ArrayProto.concat,
	toString         = ObjProto.toString,
	hasOwnProperty   = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
  var
      nativeForEach      = ArrayProto.forEach,
      nativeMap          = ArrayProto.map,
      nativeReduce       = ArrayProto.reduce,
      nativeReduceRight  = ArrayProto.reduceRight,
      nativeFilter       = ArrayProto.filter,
      nativeEvery        = ArrayProto.every,
      nativeSome         = ArrayProto.some,
      nativeIndexOf      = ArrayProto.indexOf,
      nativeLastIndexOf  = ArrayProto.lastIndexOf,
      nativeIsArray      = Array.isArray,
      nativeKeys         = Object.keys,
      nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
      if (obj instanceof _) return obj;
      if (!(this instanceof _)) return new _(obj);
      this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
      if (typeof module !== 'undefined' && module.exports) {
	  exports = module.exports = _;
      }
      exports._ = _;
  } else {
      root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
      if (obj == null) return;
      if (nativeForEach && obj.forEach === nativeForEach) {
	  obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
	  for (var i = 0, l = obj.length; i < l; i++) {
	      if (iterator.call(context, obj[i], i, obj) === breaker) return;
	  }
      } else {
	  for (var key in obj) {
	      if (_.has(obj, key)) {
		  if (iterator.call(context, obj[key], key, obj) === breaker) return;
	      }
	  }
      }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      each(obj, function(value, index, list) {
	      results[results.length] = iterator.call(context, value, index, list);
	  });
      return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
      var initial = arguments.length > 2;
      if (obj == null) obj = [];
      if (nativeReduce && obj.reduce === nativeReduce) {
	  if (context) iterator = _.bind(iterator, context);
	  return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
      }
      each(obj, function(value, index, list) {
	      if (!initial) {
		  memo = value;
		  initial = true;
	      } else {
		  memo = iterator.call(context, memo, value, index, list);
	      }
	  });
      if (!initial) throw new TypeError(reduceError);
      return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
      var initial = arguments.length > 2;
      if (obj == null) obj = [];
      if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
	  if (context) iterator = _.bind(iterator, context);
	  return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
      }
      var length = obj.length;
      if (length !== +length) {
	  var keys = _.keys(obj);
	  length = keys.length;
      }
      each(obj, function(value, index, list) {
	      index = keys ? keys[--length] : --length;
	      if (!initial) {
		  memo = obj[index];
		  initial = true;
	      } else {
		  memo = iterator.call(context, memo, obj[index], index, list);
	      }
	  });
      if (!initial) throw new TypeError(reduceError);
      return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
      var result;
      any(obj, function(value, index, list) {
	      if (iterator.call(context, value, index, list)) {
		  result = value;
		  return true;
	      }
	  });
      return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
      each(obj, function(value, index, list) {
	      if (iterator.call(context, value, index, list)) results[results.length] = value;
	  });
      return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
      return _.filter(obj, function(value, index, list) {
	      return !iterator.call(context, value, index, list);
	  }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
      iterator || (iterator = _.identity);
      var result = true;
      if (obj == null) return result;
      if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
      each(obj, function(value, index, list) {
	      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
	  });
      return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
      iterator || (iterator = _.identity);
      var result = false;
      if (obj == null) return result;
      if (nativeSome && obj.some === nativeSome) return obj.some(iude`.
								 _.contains = _.include = function(obj, target) {
								     if (obj == null) return false;
								     if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
								     return any(obj, function(value) {
									     return value === target;
									 });
								 };

								 // Invoke a method (with arguments) on every item in a collection.
								 _.invoke = function(obj, method) {
								     var args = slice.call(arguments, 2);
								     var isFunc = _.isFunction(method);
								     return _.map(obj, function(value) {
									     return (isFunc ? method : value[methodn(value) {
											 for (var key in attrs) {
											     if (attrs[key] !== value[key]) return false;
											 }
											 return true;
										     });
										 };

									     // Convenience version of a common use case of `find`: getting the first object
									     // containing specific `key:value` pairs.
									     _.findWhere = function(obj, attrs) {
										 return _.where(obj, attrs, true);
									     };

									     // Return the maximum element or (element-based computation).
									     // Can't optimize arracomputed});
									 });
								     return result.value;
								 };

								 // Return the minimum element (or element-based computation).
								 _.min = function(obj, iterator, context) {
								     if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
									 return Math.min.apply(Math, obj);
								     }
								     if (!iterator && _.isEmpty(obj)) return Infinity;
								     var result = {computed : Infinity, value: Infinity};
								     each(obj, function(value, index, list) {
									     var computed = iterator ? iterator.call(context, value, index,alue) {
										 return _.isFunction(value) ? value : function(obj){ return obj[value]; };
									     };

									     // Sort the object's values by a criterion produced by an iterator.
									     _.sortBy = function(obj, value, context) {
										 var iterator = lookupIterator(value);
										 return _.pluck(_.map(obj, function(value, index, list) {
											     return {
												 value : value,
												     index : index,
												     criteria : iterator.call(context, value, index, list)
												     };
											 }).sort(function(j);
												 behavior(result, key, value);
												 });
										 return result;
									     };

									     // Groups the object's values by a criterion. Pass either a string attribute
									     // to group by, or a function that returns the criterion.
									     _.groupBy = function(obj, value, context) {
										 return group(obj, value, context, function(result, key, value) {
											 (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
											 ntity : lookupIterator(iterator);
											 var value = iterator.call(context, obj);
											 var low = 0, high = array.length;
											 while (low < high) {
											     var mid = (low + high) >>> 1;
											     iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
											 }
											 return low;
										     };

										     // Safely convert anything iterable into a real, live array.
										     _.toArray = function(obj) {
											 if (!obj) return [];
											 if (_.isArray(obj)) return slice.call(obj);
											 if (obj.length === +obj.length) return _.map(obj, _.identity);
											 return _.vrd) {
											 if (array == null) return void 0;
											 return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
										     };

										     // Returns everything but the last entry of the array. Especially useful on
										     // the arguments object. Passing **n** will return all the values in
										     // the array, excluding the last N. The **guard** check allows it to work with
										     // `_.map`.
										     _.initial = function(array, n, guard) {
											 return slice.call(arrayng an **n** will return
													   // the rest N values in the array. The **guard**
													   // check allows it to work with `_.map`.
													   _.rest = _.tail = _.drop = function(array, n, guard) {
													       return slice.call(array, (n == null) || guard ? 1 : n);
													   };

													   // Trim out all falsy values from an array.
													   _.compact = function(array) {
													       return _.filter(array, _.identity);
													   };

													   // Internal imple;

													   // Produce a duplicate-free version of the array. If the array has already
													   // been sorted, you have the option of using a faster algorithm.
													   // Aliased as `unique`.
													   _.uniq = _.unique = function(array, isSorted, iterator, context) {
													       if (_.isFunction(isSorted)) {
														   context = iterator;
														   iterator = isSorted;
														   isSorted = false;
													       }
													       var initial = iterator ? _.map(array, iterator, context) : array;
													       var results = [];
													       var seen = [];
													       each(initial, fuion(array) {
														       var rest = slice.call(arguments, 1);
														       return _.filter(_.uniq(array), function(item) {
															       return _.every(rest, function(other) {
																       return _.indexOf(other, item) >= 0;
																   });
															   });
														   };

														   // Take the difference between one array and a number of other arrays.
														   // Only the elements present in just the first array will remain.
														   _.difference = function(array) {
														       var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
														       return _.filter(as of the same length -- one of keys, and one of
																       // the corresponding values.
																       _.object = function(list, values) {
																	   if (list == null) return {};
																	   var result = {};
																	   for (var i = 0, l = list.length; i < l; i++) {
																	       if (values) {
																		   result[list[i]] = values[i];
																	       } else {
																		   result[l);
																	       } else {
																		   i = _.sortedIndex(array, item);
																		   return array[i] === item ? i : -1;
																	       }
																	   }
																	   if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
																	   for (; i < l; i++) if (array[i] === item) return i;
																	   return -1;
																       };

																       // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
																       _.lastIndexOf = function(array, item, from) {
																	   if (array == nngth <= 1) {
																	       stop = start || 0;
																	       start = 0;
																	   }
																	   step = arguments[2] || 1;

																	   var len = Math.max(Math.ceil((stop - start) /slice.call(arguments, 1);
																					return function() {
																					    return func.apply(this, args.concat(slice.call(arguments)));
																					};
																					};

																			      // Bind all of an object's methods to that object. Useful for ensuring that
																			      // all callbacks defined on an object belong to it.
																			      _.bindAll = function(obj) {
																				  vaturn func.apply(null, args); }, wait);
																       };

																       // Defers a function, scheduling it to run after the current call stack has
																       // cleared.
																       _.defer = function(func) {
																	   return _.deion, that, as long as it continues to be invoked, will not
																	   // be triggered. The function will be called after it stops being called for
																	   // N milliseconds. If `immediate` is passed, trigger the function on the
																	   // leading edge, instead of the trailing.
																	   _.debounce = function(func, wait, immediate) {
																	       var timeout, result;
																	       return functi;
																	       func = null;
																	       return memo;
																	   };
																       };

																       // Returns tply(this, arguments);
																       }
														   };
														   };

													       // Object Functions
													       // ----------------

													       // Retrieve the names of an object's properties.
													       // Delegates to **ECMAScript 5**'s native `Object.keys`
													       _.keys = nativeKeys    return result;
													   };

													   // Return a sorted list of the function n= concat.apply(ArrayProto, slice.call(arguments, 1));
													   for (var key in obj) {
													       if (!_.contains(keys, key)) copy[key] = obj[key];
													   }
													   return copy;
													   };

											 // Fill in a given object with default properties.
											 _.defaults = function(obj) {
											     each(slice.call(arguments, 1), function(source) {
												     if (source) {
													 for (var prop in soion(a, b, aStack, bStack) {
														 // Identical objects are equal. `0 === -0`, but they aren't identical.
														 // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
														 if (a === b) return a !== 0 || 1 / a == 1 / b;
														 // A strict comparison is necessary because `null == undefined`.
														 if (a    // other numeric values.
														     return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
														 case '[object Date]':
														 case '[object Boolean]':
														     // Coerce dates and booleans to numeric primitive values. Dates are compared by their
														     // millisecond representations. Note tproportional to the number of
														     // unique nested structures.
														     if (aStack[length] == a) return bStack[length] == b;
														     }
														 // Add the first object to the stack of traversed objects.
														 aStack.push(a);
														 bStack.push(b);
														 var size = 0, result = true;
														 // Recursively compare objects and arrays.
														 if (className == '[object Array]') {
														     // Compare array lengths to de.constructtanceof bCtor))) {
														     return false;
														 }
														 // Deep compare objects.
														 for (var key in a) {
														     if (_.has(a, key)) {
															 // Count the expected number of properties.
															 size++;
															 // Deep compare each member.
															 if (!(result = _.has(b, key) && eq(a[key], b[key], aSt_.isString(obj)) return obj.length === 0;
															       for (var key in obj) if (_.has(obj, key)) return false;
															       return true;
															       };

															     // Is a given value a DOM element?
															     _.isElement = function(obj) {
																 return !!(obj && obj.nodeType === 1);
															     };

															     // Is a given value an array?
															     // Delegates to ECMA5's native Array.isArray
															     _.isArray = nativeIsArray || function(obj) {
																 return toString.call(obj) == '[object Array]';
															     };

															     // Is a given variable an object?
															     _.isObject = function(obj) {
																 return !!(obj && _.has(obj, 'callee'));
															     };
															     }

															 // Optimize `isFunction` if appropriate.
															 if (typeof (/./) !== 'function') {
															     _.isFunction = function(obj) {
																 return typeof obj === 'function';
															     };
															 }

															 // Is a given object a finite number?
															 _.isFinite = function(obj) {
															     return isFinite(obj) && !isNaN(parseFloat(obj));
															 };

															 // Is the given value `NaN`? (NaN is the only nu, key) {
															 return hasOwnProperty.call(obj, key);
														     };

														     // Utility Functions
														     // -----------------

														     // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
														     // previous owner. Returns a reference to the Underscore object.
														     _.noConflict = function() {
															 root._ = previousUnderscore;
															 return this;
														     };

														     // Keep the identity function around for default iterators.
														     _.identity = function(value) {
															 return value;
														     };

														     quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
 s to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

/*global _: false, $: false, localStorage: false, process: true,
  XMLHttpRequest: false, XDomainRequest: false, exports: false,
  require: false */
(function(root) {
  root.Parse = root.Parse || {};
  /**
   * Contains all Parse API classes and functions.
   * @name Parse
   * @namespace
   *
   * Contains all Parse API classes and functions.
   */
  var Parse = root.Parse;

  // Import Parse's local copy of underscore.
  if (typeof(exports) !== "undefined" && exports._) {
    // We're running in Node.js.  Pull in the dependencies.
    Parse._ = exports._.noConflict();
    Parse.localStorage = require('localStorage');
    Parse.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
    exports.Parse = Parse;
  } else {
    Parse._ = _.noConflict();
    if (typeof(localStorage) !== "undefined") {
      Parse.localStorage = localStorage;
    }
    if (typeof(XMLHttpRequest) !== "undefined") {
      Parse.XMLHttpRequest = XMLHttpRequest;
    }
  }

  // If jQuery or Zepto has been included, grab a reference to it.
  if (typeof($) !== "undefined") {
    Parse.$ = $;
  }

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var EmptyConstructor = function() {};

  
  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      /** @ignore */
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    Parse._.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    EmptyConstructor.prototype = parent.prototype;
    child.prototype = new EmptyConstructor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
      Parse._.extend(child.prototype, protoProps);
    }

    // Add static properties to the constructor function, if supplied.
    if (staticProps) {
      Parse._.extend(child, staticProps);
    }

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is
    // needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set the server for Parse to talk to.
  Parse.serverURL = "https://api.parse.com";

														     // Check whether we are running in Node.js.
														     if (typeof(process) !== "undefined" &&
      process.versions &&
															 process.versions.node) {
															 Parse._isNode = true;
														     }

														     /**
														      * Call this method first to set up your authentication tokens for Parse.
														      * You can get your keys from the Data Browser on parse.com.
														      * @param {String} applicationId Your Parse Application ID.
														      * @param {String} javaScriptKey Your Parse JavaScript Key.
														      * @param {String} masterKey (optional) Your Parse Master Key. (Node.js only!)
														      */
														     Parse.initialize = function(applicationId, javaScriptKey, masterKey) {
															 if (masterKey) {
      throw "Parse.initialize() was passed a Master Key, which is only " +
      "allowed from within Node.js.";
															 }
															 Parse._initialize(applicationId, javaScriptKey);
														     };

														     /**
														      * Call this method first to set up master authentication tokens for Parse.
														      * This method is for Parse's own private use.
														      * @param {String} applicationId Your Parse Application ID.
														      * @param {String} javaScriptKey Your Parse JavaScript Key.
														      * @param {String} masterKey Your Parse Master Key.
														      */
														     Parse._initialize = function(applicationId, javaScriptKey, masterKey) {
															 Parse.applicationId = applicationId;
															 Parse.javaScriptKey = javaScriptKey;
															 Parse.masterKey = masterKey;
															 Parse._useMasterKey = false;
														     };

														     // If we're running in node.js, allow using the master key.
														     if (Parse._isNode) {
															 Parse.initialize = Parse._initialize;

															 Parse.Cloud = Parse.Cloud || {};
															 /**
															  * Switches the Parse SDK to using the Master key.  The Master key grants
															  * priveleged access to the data in Parse and can be used to bypass ACLs and
															  * other restrictions that are applied to the client SDKs.
															  * <p><strong><em>Available in Cloud Code and Node.js only.</em></strong>
															  * </p>
															  */
															 Parse.Cloud.useMasterKey = function() {
															     Parse._useMasterKey = true;
															 };
														     }

														     /**
														      * Returns prefix for localStorage keys used by this instance of Parse.
														      * @param {String} path The relative suffix to append to it.
														      *     null or undefined is treated as the empty string.
														      * @return {String} The full key name.
														      */
														     Parse._getParsePath = function(path) {
															 if (!Parse.applicationId) {
															     throw "You need to call Parse.initialize before using Parse.";
															 }
															 if (!path) {
															     path = "";
															 }
															 if (!Parse._.isString(path)) {
															     throw "Tried to get a localStorage path that wasn't a String.";
															 }
															 if (path[0] === "/") {
															     path = path.substring(1);
															 }
															 return "Parse/" + Parse.applicationId + "/" + path;
														     };

														     /**
														      * Returns the unique string for this app on this machine.
														      * Gets reset when localStorage is cleared.
														      */
														     Parse._installationId = null;
														     Parse._getInstallationId = function() {
															 // See if it's cached in RAM.
															 if (Parse._installationId) {
															     return Parse._installationId;
															 }

															 // Try to get it from localStorage.
															 var path = Parse._getParsePath("installationId");
															 Parse._installationId = Parse.localStorage.getItem(path);

															 if (!Parse._installationId || Parse._installationId === "") {
															     // It wasn't in localStorage, so create a new one.
															     var hexOctet = function() {
																 return Math.floor((1+Math.random())*0x10000).toString(16).substring(1);
															     };
															     Parse._installationId = (
																		      hexOctet() + hexOctet() + "-" +
																		      hexOctet() + "-" +
																		      hexOctet() + "-" +
																		      hexOctet() + "-" +
																		      hexOctet() + hexOctet() + hexOctet());
															     Parse.localStorage.setItem(path, Parse._installationId);
															 }

															 return Parse._installationId;
														     };

														     Parse._parseDate = function(iso8601) {
															 var regexp = new RegExp(
      "^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})" + "T" +
      "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})" +
      "(.([0-9]+))?" + "Z$");
															 var match = regexp.exec(iso8601);
															 if (!match) {
															     return null;
															 }

															 var year = match[1] || 0;
															 var month = (match[2] || 1) - 1;
															 var day = match[3] || 0;
															 var hour = match[4] || 0;
															 var minute = match[5] || 0;
															 var second = match[6] || 0;
															 var milli = match[8] || 0;

															 return new Date(Date.UTC(year, month, day, hour, minute, second, milli));
														     };

														     Parse._ajaxIE8 = function(method, url, data) {
															 var promise = new Parse.Promise();
															 var xdr = new XDomainRequest();
															 xdr.onload = function() {
															     var response;
															     try {
																 response = JSON.parse(xdr.responseText);
															     } catch (e) {
																 promise.reject(e);
															     }
															     if (response) {
																 promise.resolve(response);
															     }
															 };
															 xdr.onerror = xdr.ontimeout = function() {
															     promise.reject(xdr);
															 };
															 xdr.onprogress = function() {};
															 xdr.open(method, url);
															 xdr.send(data);
															 return promise;
														     };

  
														     Parse._ajax = function(method, url, data, success, error) {
															 var options = {
															     success: success,
															     error: error
															 };

															 if (typeof(XDomainRequest) !== "undefined") {
															     return Parse._ajaxIE8(method, url, data)._thenRunCallbacks(options);
															 }

															 var promise = new Parse.Promise();
															 var handled = false;

															 var xhr = new Parse.XMLHttpRequest();
															 xhr.onreadystatechange = function() {
															     if (xhr.readyState === 4) {
																 if (handled) {
																     return;
																 }
																 handled = true;

																 if (xhr.status >= 200 && xhr.status < 300) {
																     var response;
																     try {
																	 response = JSON.parse(xhr.responseText);
																     } catch (e) {
																	 promise.reject(e);
																     }
																     if (response) {
																	 promise.resolve(response, xhr.status, xhr);
																     }
																 } else {
																     promise.reject(xhr);
																 }
															     }
															 };
															 xhr.open(method, url, true);
															 xhr.setRequestHeader("Content-Type", "text/plain");  // avoid pre-flight.
															 if (Parse._isNode) {
															     // Add a special user agent just for request from node.js.
															     xhr.setRequestHeader("User-Agent",
                           "Parse/" + Parse.VERSION +
																		  " (NodeJS " + process.versions.node + ")");
															 }
															 xhr.send(data);
															 return promise._thenRunCallbacks(options);
														     };

														     // A self-propagating extend function.
														     Parse._extend = function(protoProps, classProps) {
															 var child = inherits(this, protoProps, classProps);
															 child.extend = this.extend;
															 return child;
														     };

														     /**
														      * route is classes, users, login, etc.
														      * objectId is null if there is no associated objectId.
														      * method is the http method for the REST API.
														      * dataObject is the payload as an object, or null if there is none.
														      * @ignore
														      */
														     Parse._request = function(route, className, objectId, method, dataObject) {
															 if (!Parse.applicationId) {
															     throw "You must specify your applicationId using Parse.initialize";
															 }

															 if (!Parse.javaScriptKey && !Parse.masterKey) {
															     throw "You must specify a key using Parse.initialize";
															 }

    
															 if (route !== "batch" &&
        route !== "classes" &&
        route !== "files" &&
        route !== "functions" &&
        route !== "login" &&
        route !== "push" &&
															     route{});
															 if (method !== "POST") {
															     dataObject._method = method;
															     method = "POST";
															 }

															 dataObject._ApplicationId = Parse.applicationId;
															 if (!Parse._useMasterKey) {
															     dataObject._JavaScriptKey = Parse.javaScriptKey;
															 } else {
															     dataObject._MasterKey = Parse.masterKey;
															 }

															 dataObject._ClientVersion = Parse.VERSION;
    dataObject._InstallationId = Parse
															 error = new Parse.Error(errorJSON.code, errorJSON.error);
														     }
														     } catch (e) {
														     // If we fail to parse the error text, that's okay.
														 }
														 }
														  error = error || new Parse.Error(-1, response.responseText);
													      // By explicitly returning a rejected Promise, this will work with
													      // either jQuery or Promises/A semantics.
													      return Parse.Promise.error(error)ris array will be used to prevent going into an infinite
   * loop because we have circular references.  If <seenObjects>
														  * is set, then none of the Parse Objects that are serialized can be dirty.
   */
														  Parse._encode = function(value, seenObjects, disallowObjects) {
														  var _ = Parse._;
														  if (value instanceof Parse.Object) {
														      if (disallowObjects) {
															  throw "Parse.Objects not allowed here";
														      }
														      if (!seenObjects || _.include(seenOb    if (value instanceof Parse.GeoPoint) {
																  return value.toJSON();
															      }
															      if (_.isArray(value)) {
																  return _.map(value, function(x) {
																	  return Parse._encode(x, seenObjects, disallowObjects);
																      });
															      }
															      if (_.isRegExp(value)) {
																  return value.source;
															      }
															      if (value instanceof Parse.Relation) {
																  return value.toJSON();
															      }
															      if (value instanceof Parse.Op) {ode = function(key, value) {
																      var _ = Parse._;
																      if (!_.isObject(value)) {
																	  return value;
																      }
																      if (_.isArray(value)) {
																	  Parse._arrayEach(value, function(v, k) {
																		  value[k] = Parse._decode(k, v);
																	      });
																	  return value;
																      }
																      if (value instanceof Parse.Object) {
																	  return value;
																      }
																      if (value instanceof Parse.File) {
																	  return value;
																      }
																      if (value instanceof Parse.e.__type === "Date") {
																	  return Parse._parseDate(value.iso);
																      }
																      if (value.__type === "GeoPoint") {
																	  return new Parse.GeoPoint({
																		  latitude: value.latitude,
																		  longitude: value.longitude
																	      });
																      }
																      if (key === "ACL") {
																	  if (value instanceof Parse.ACL) {
																	      return value;
																	  }
																	  return new Parse.ACL(value);
																      }
																      if (value.__type === "Relation") {
																	  var relation = new Parse.Relation(null, key);
																	  relation.targetClassName = value.className;
																	  return relation;
																      }
    ifjor every item. It will
																      *     be passed the item as an argument. If it returns a truthy value, that
   *     value will replace the item in its parent container.
																      * @returns {} the result of calling func on the top-level object itself.
   */
																      Parse._traverse = function(object, func, seen) {
	if (object instanceof Parse.Object) {
	    seen = seen || [];
	    if (Parse._.indexOf(seen, object) >= 0) {
		// We've already visited this object in thi
	    }
	});
																      return func(object);
																  }
																  if (Parse._.isObject(object)) {
																      Parse._each(object, function(child, key) {
																	      var newChild = Parse._traverse(child, func, seen);
																	      if (newChild) {
																		  object[key] = newChild;
																	      }
																	  });
																      return func(object);
																  }
																  return func(object);
															      };

															      /**
															       * This is like _.each, except:
															       * * it doesn't work for so-called array-like objects,
															       * * it does work for dictionaries with a "length" attribute.
															       */
  Parse._objectEac  * Constructs a new Parse.Error object with the given code and message.
															      * @param {Number} code An error code constant from <code>Parse.Error</code>.
															      * @param {String} message A detailed description of the error.
   * @class
   *
   * <p>Class used for all objects passed to error callbacks.</p>
   */
															      Parse.Error = function(code, message) {
	  this.code = code;
	  this.message = message;
      };

															      _.extend(Parse.Error, /** @lends Parse.Error */ {
																      /**
																       * Error code indicating some error other than those enumerated here.
																       * @constant
																       */
																      OTHER_CAUSE: -1,

																	  /**
																	   * Error code indicating that something hsn't exist.
																	   * @constant
																	   */
																	  OBJECT_NOT_FOUND: 101,

																	  /**
																	   * Error code indicating you tried to query with a datatype that doesn't
																	   * support it, like exact matching an array or object.
																	   * @constant
																	   */
																	  INVALID_QUERY: 102,

																	  /**
																	   * Error code indicating a missing or invalid classname. Classnames are
																	   * case-se INVALID_POINTER: 106,

																	   /**
																	   * Error code indicating that badly formed JSON was received upstream. This
																	   * either indicates you have done something unusual with modifying how
																	   * things encode to JSON, or the network is failing badly.
																	   * @constant
																	   */
																	  INVALID_JSON: 107,

																	  /**
																	   * Error code indicating that the feature you tried to access is only
																	   * available internally for testing purposes.
																	   * @constant
																	   */
																	  COMMAND_UNAVAILABLE: 108,

																	  /**
																	   * You must call Parse.initialize before using the Parse library.
																	   * Error code indicating that push is misconfigured.
																	   * @constant
																	   */
																	  PUSH_MISCONFIGURED: 115,

																	  /**
																	   * Error code indicating that the object is too large.
																	   * @constant
																	   */
																	  OBJECT_TOO_LARGE: 116,

																	  /**
																	   * Error code indicating that the operation isn't allowed for clients.
																	   * @constant
																	   */
																	  OPERATION_FORBIDDEN: 119,

																	  /**
																	   * Error code  code indicating that the request timed out on the server. Typically
																	   * this indicates that the request is too expensive to run.
																	   * @constant
																	   */
																	  TIMEOUT: 124,

																	  /**
																	   * Error code indicating that the email address was invalid.
																	   * @constant
																	   */
																	  INVALID_EMAIL_ADDRESS: 125,

																	  /**
																	   * Error code indicating a missing content*
																	   * Error code indicating that a unique field was given a value that is
																	   * already taken.
																	   * @constant
																	   */
																	  DUPLICATE_VALUE: 137,

																	  /**
																	   * Error code indicating that a role's name is invalid.
																	   * @constant
																	   */
																	  INVALID_ROLE_NAME: 139,

																	  /**
																	   * Error c
																	   * Error code indicating that the username is missing or empty.
																	   * @constant
																	   */
																	  USERNAME_MISSING: 200,

																	  /**
																	   * Error code indicating that the password is missing or empty.
																	   * @constant
																	   */
																	  PASSWORD_MISSING: 201,

																	  /**
																	   * Error code indicating that the username has already been taken.
																	   * @constant
																	   */
																	  USERNAME_TAKEN: 202,

																	  /**
																	   * Error code indicating that the email has already been taken.
																	   * @constant
																	   */
																	  EMAIL_TAKEN: 203,

																	  /**
																	   * Error code indicating that the enup.
																	   * @constant
																	   */
																	  MUST_CREATE_USER_THROUGH_SIGNUP: 207,

																	  /**
																	   * Error code indicating that an an account being linked is already linked
																	   * to another user.
																	   * @constant
																	   */
																	  ACCOUNT_ALREADY_LINKED: 208,

																	  /**
																	   * Error code indicating that a user cannot be linked to an account because
																	   * that account's id could not be found.
																	   * @constant
																	   */
																	  LINKED_ID_MISSING: 250,

																	  /**
																	   * Error code indicating that a user with a linked (e.g. Facebook) account
																	   * has an invalid session.
																	   * @constant
																	   */
																	  INVALID_LINKED_SESSION: 251,

																	  /**
																	   * Error code indicating that a service being linked (e.g. Facebook or
																	   * Twitter) is unsupported.
																	   * @constant
																	   */
																	  UNSUPPORTED_SERVICE: 252
																	  });

															      }(this));

														      /*global _: false */
														      (function() {
															  var root = this;
															  var Parse = (root.Parse || (root.Parse = {}));
															  var eventSplitter = /\s+/;
															  var slice = Array.prototype.slice;

															  /**
															   * @class
															   *
															   * <p>Parse.Events is a fork of Backbone's Events module, provided for your
															   * convenience.</p>
															   *
															   * <p>A module that can be mixed in to any object in order to provide
															   * it with custom events. You may bind callback functions to an event
															   * with `on`, or remove these functions with `off`.
															   * Triggering an event fires all callbacks in the order that `on` was
															   * called.
															   *
															   * <pre>
															   *     var object = {};
															   *     _.extend(object, Parse.Events);
															   *     object.on('expand', function(){ alert('expanded'); });
															   *     object.trigger('expand');</pre></p>
															   *
															   * <p>For more information, see the
															   * <a href="http://documentcloud.github.com/backbone/#Events">Backbone
															   * documentation</a>.</p>
															   */
															  Parse.Events = {
															      /**
															       * Bind one or more space separated events, `events`, to a `callback`
															       * function. Passing `"all"` will bind the callback to all events fired.
															       */
															      on: function(events, callback, context) {

																  var calls, event, node, tail, list;
																  if (!callback) {
																      return this;
																  }
																  events = events.split(eventSplitter);
																  calls = this._callbacks || (this._callbacks = {});

																  // Create an immutable callback list, allowing traversal during
																  // modification.  The tail is an empty object that will always be used
																  // as the next node.
																  event = events.shift();
																  while (event) {
																      list = calls[event];
																      node = list ? list.tail : {};
																      node.next = tail = {};
																      node.context = context;
																      node.callback = callback;
																      calls[event] = {tail: tail, next: list ? list.next : node};
																      event = events.shift();
																  }

																  return this;
															      },

															      /**
															       * Remove one or many callbacks. If `context` is null, removes all callbacks
															       * with that function. If `callback` is null, removes all callbacks for the
															       * event. If `events` is null, removes all bound callbacks for all events.
															       */
															      off: function(events, callback, context) {
																  var event, calls, node, tail, cb, ctx;

																  // No events, or removing *all* events.
																  if (!(calls = this._callbacks)) {
																      return;
																  }
																  if (!(events || callback || context)) {
																      delete this._callbacks;
																      return this;
																  }

																  // Loop through the listed events and contexts, splicing them out of the
																  // linked list of callbacks if appropriate.
																  events = events ? events.split(eventSplitter) : _.keys(calls);
																  event = events.shift();
																  while (event) {
																      node = calls[event];
																      delete calls[event];
																      if (!node || !(callback || context)) {
																	  continue;
																      }
																      // Create a new list, omitting the indicated callbacks.
																      tail = node.tail;
																      node = node.next;
																      while (node !== tail) {
																	  cb = node.callback;
																	  ctx = node.context;
																	  if ((callback && cb !== callback) || (context && ctx !== context)) {
																	      this.on(event, cb, ctx);
																	  }
																	  node = node.next;
																      }
																      event = events.shift();
																  }

																  return this;
															      },

															      /**
															       * Trigger one or many events, firing all bound callbacks. Callbacks are
															       * passed the same arguments as `trigger` is, apart from the event name
															       * (unless you're listening on `"all"`, which will cause your callback to
															       * receive the true name of          args = [event].concat(rest);
          while ((node = node.next) key.</p>
	  *
	  * <p>Only one key in a class may contain a GeoPoint.</p>
	  *
	  * <p>Example:<pre>
	  *   var    if (thon of the coordinate, in range
	  *   [-180, 180].  Throws if set out of range in a modern browser.
	  */

															      /**
															       * Throws an exception if the given lat-long is ction(locatio= point.longitude * d2r;
      var deltaLat = lat1rad - lat2rad;
      var deltaLong = long1rad - long2rad;
      var sinDeltaLatDiv2 = Math.sin(deltaLat / 2)nsTo(poire, userId,  instanceof Parse.Role) {
      userId = "role:" + userId.getName();
    }
    var permissions = this.permissionsById[userId];
    if (!permissions) {
      return false;
    }
    return permissions[accessType] ? true : false;
  };

  /**
  * Set whether the given user is allowed to read this object.
  * @param userId An instance of Parse.User or its objectId.
  * @param {Boolean} allowed Whether that user should have read access.
  */
															      Parse.ACL.prototype.setRrId);
														      };

															  /**
															   * Set whether the given user id is allowed to write this object.
															   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
															   * @param {Boolean} allowed Whether that user should have write access.
															   */
															  Parse.ACL.prototype.setWriteAccess = function(userId, allowed) {
															      this._setAccess("write", userId, allowed);
															  };

															  /**
															   * Get whether the given user id is *explicitly* allowed to write this object.
															   * Even if this returns false, the user may still be able to write it if
															   * getPublicWriteAccess returns true or a role that the user belongs to has
															   * write access.
															   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
															   * @return {Boolean}
															   */
															  ParseAccess(PUBLIC_KEY, allowed);
															  };

														      /**
														       * Get whether the public is allowed to read this object.
														       * @return {Boolean}
														       */
														      Parse.ACL.prototype.getPublicReadAccess = function() {
															  return this.getReadAccess(PUBLIC_KEY);
														      };

														      /**
														       * Set whether the public is allowed to write this object.
														       * @param {Boolean} allowed
														       */
														      Parse.ACL.prototype.setPublicWriteAccess = function(allowed) {
															  this.setWriteAccess(PUBLIC_KEY, allowed);
														      };

														      /**
														       * Get whether the public is allowed to write this object.
														       * @return {Boolean}
														       */
														      ng} If role is neither a Parse.Role nor a String.
   */
														  Parse.ACL.prototype.getRoleReadAccess = function(role) {
														      if (role instanceof Parse.Role) {
															  // Normalize to the String name
															  role = role.getName();
														      }
														      if (_.isString(role)) {
															  return this.getReadAccess("role:" + role);
														      }
														      throw "role must be a Parse.Role or a String";
														  };
  
														  /**
														   * Get whether users belonging to the given role are allowed
														   * to write this object. Even if this returns false, the role may
														   * still be able to write it if a parent rolele:" + role);
    }
    throw "role must be a Parse.Role or a String";
  };
  
  /**
  * Set whether users belonging to the given role are allowed
  * to read this object.
  * 
  * @param role The name of the role, or a Parse.Role object.
  * @param {Boolean} allowed Whether the given role can read this object.
  * @throws {String} If role is neither a Parse.Role nor a String.
  */
														  Parse.ACL.prototype.setRoleReadAccess = function(role, allowed) {
														      if (role instanceof Parse.Ror";
nor a String.
   */
  Parse.ACL.prototype.setRoleWriteAccess = function(role, allowed) {
    if (role instanceof Parse.Role) {
      // Normalize to the String name
      role = role.getName();
    }
    if (_.isString(role)) {
      this.setWriteAccess("role:" + role, allowed);
      return;
    }
    throw "role must be a Parse.Role or a String";
  };

}(this));

(function(root) {
  root.Parse = root.Parse || {};
  var Parse = root.Parse;
  var _ = Parse._;

  /**
   * @class
   * A Parse.Op is an atomic operation that can be applied to a field in a
   * Parse.Object. For example, calling <code>object.set("foo", "bar")</code>
   * is an example of a Parse.Op.Set. Calling <code>obje= function() {
    this._initialize.apply(this, arguments);
  };

  Parse.Op.prototype = {
    _initialize: function() {}
  };

  _.extend(Parse.Op, {
    /**
     * To create a new Op, call Parse.Op._extend();
     */
    _extend: Parse._extend,

    // A map of __op string to decoder function.
    _opDecoderMap: {},

    /**
     * Registers a function to convert a json object with an __op field into an
     * instance of a subclass of Parse.Op.
     */
    _registerDecoder: function(opName, decoder) {
      Parse.Op._opDecoderMap[opName] = decoder;
    },

    /**
     * Converts a json object into an instance of a subclass of Parse.Op.
     */
    _decode: function(json) {
      var decoder = Parse.Op._opDecoderMap[json.__op];
      if (decoder) {
        return decoder(json);
      } else {
        return undefined;
      }
    }
  });

  /*
   * Add a handler for Batch ops.
   */    nextOp = Parse.Op._decode(nextOp);
      op = nextOp._mergeWithPrevious(op);
    });
    return op;
  });

  /**
   * @class
   * A Set operation indicates that either the field was changed using
   * Parse.Object.set, or it is a mutable container that was detected as being
   * changed.
   */
  Parse.Op.Set = Parse.Op._extend(/** @lends Parse.Op.Set.prototype */ {
    _initialize: function(value) {
      this._value = value deleted. Basically, if you find _UNSET as a
   * value in your object, you should remove that key.
  {
      this._amount = amount;
    },

    /**
     * Returns the amount to increment by.
     * @return {Number} the amount to increment by.
     */
    amount: function() {
      return this._amount;
    },

    /**
     * Returns a JSON version of the operation suitable for sending to Parse.
     * @return {Object}
     */
    toJSON: function() {
      return { __op: "Increment", amount: this._.amount();
      }
      return oldValue + this.amount();
    }
  });

  Parse.Op._registerDecoder("Increment", function(json) {
    return new Parse.Op.Increment(json.amount);
  });

  /**
   * @cp.Unset) {
        return new Parse.Op.Set(this.objects());
      } else if (previous instanceof Parse.Op.Set) {
        return new Parse.Op.Set(this._estimate(previous.value()));
      } else if (previous instanceof Parse.Op.Add) {
        return new Parse.Op.Add(previous.objects().concat(this.objects()));
      } else {
        throw "Op is invalid after previous op.";
      }
    },

    _estimate: function(oldValue) {
      if (!(objects) {
      this._objects = _.uniq(objects);
    },

    /**
     * Returns the objects to be added 

    _estimate: function(oldValue) {
      if (!oldValue) {
        } els "Remove", objects: Parse._encode(this.objects()) };
    },

    _mergeW) && (other.id === obj.id);
            });
          }
        });
        return newValue;
      }
    }
  });

  Parse.Op._registerDecoder("Remove", function(json) {
    return new Parse.Op.Remove(Parse._decode(undefined, json.objects));
  });

  /**
   * @class
   * A Relation operation indicates that the field is an instance of
   * Parse.Relation, and objects are being added to, or removed from, that
   * relation.
   */
  Parse.Op.Relation = Parse.Op._extend(
      /** @lends Parse.Op.Relation.prototype */ {

    _initialize: function(adds, removes) {
      this._targetClassName = null;

      var self = this;

      var pointerToId = function(object) {
        if (object instanceof Parse.Object) {
          if (!object.id) {
            throw "You can't add an unsaved Parse.Object to a relation.";
          }
          if (!self._reate a Parse.Relation with 2 different types: " +
                  self._targetClassName + " and " + object.className + ".";
          }
          return object.id;
        }
        return object;
      };

      this.relationsToAdd = _.uniq(_.map(adds, pointerToId));
      this.relationsToRemove = _.uniq(_.map(removes, pointerToId));
    },

    /**
     * Returns an array of unfetched Parse.Object that are being added to the
     * relation.
     * @return {Array}
     */
    added: function() {
      var self = this;
      return _.map(this.relationsToAdd, function(objectId) {
        var object = Parse.Object._create(self._targetClassName);
        object.id = ob._targetClassName);
        object.id = objectId;
        return object;
      });
    },

    /**
     * Returns a JSON version of the operation suitable for sending to Parse.
     * @return {Object}
     */
    toJSON: function() {
      var adds = null;
      var removes = null;
      var self = this;
      var idToPointer = function(id) {
        return { __type: 'Pointer',
                 className: self._targetClassName,
                 objectId: id };
      };
      var pointers = null;
      if (this.relationsToAdd.length > 0) {
        pointers = _.map(this.relationsToAdd, idToPointer);
        adds = { "__op": "AddRelation", "objects": pointers };
      }

      if (this.relationsToRemove.length > 0) {
        pointers = _.map(this.relationsToRemove, idToPointer);
        removes = { "__op": "RemoveRelation", "objects": pointers ious: function(previous) {
      if (!previous) {
        return this;
      } else if (previous instanceof Parse.Op.Unset) {
        throw "You can't modify a relation after deleting it.";
      } else if (previous instanceof Parse.Op.Relation) {
        if (previous._targetClassName &&
            previous._targetClassName !== this._targetClassName) {
          throw "Related object must be of class " + previous._targetClassName +
              ", but " + this._targetClassName + " was passed in.";
        }
        var newAdd = _.union(_.difference(previous.relationsToAdd,
                                          this.relationsToRemove),
                             this.relationsToAdd);
        var newRemove = _.union(_.difference(previous.relationsToRemove,
      me;
        return newRelation;
      } else {
        throw "Op is invalid after previous op.";
      }
    },

    _estimate: function(oldValue, object, key) {
      if (!oldValue) {
        var relation = new Parse.Relation(object, key);
        relation.targetClassName = this._targetClassName;
      } else if (oldValue instanceof Parse.Relation) {
        if (this._targetClassName) {
          if (oldValue.targetClassName) {
            if (oldValue.targetClassName !== this._targetClassName) {
              throw "Related object must be a " + oldValue.targetClassName +
                  ", but a " + this._targetClassName + " was passed in.";
            }
          } else {
            oldValue.targetClassName = this._targetClassName;
          }
        }
        retur;
  Parse.Op._registerDecoder("RemoveRelation", function(json) {
    return new Parse.Op.Relation([], Parse._decode(undefined, json.objects));
  });

}(this));

(function(root) {
  root.Parse = root.Parse || {};
  var Parse = root.Parse;
  var _ = Parse._;

  /**
   * Creates a new Relation for the given parent object and key. This
   * constructor should rarely be used directly, but rather cn has the right parent and key.
     */
    _ensureParentAndKey: function(parent, key) {
      this.parent = this.parent || parent;
      this.key = this.key || key;
      if (this.parent !== parent) {
        throw "Internal Error. Relation retrieved from two different Objects.";
      }
      if (this.key !== key) {
        throw "Internal Error. Relation retrieved from two different keys.";
      }
    },

    /**
     * Adds a Parse.Object or an array of Parse.Objects to the relation.
     * @param {} objects The item or items to add.
     */
    add: function(objects) {
      if (!_.isArray(objects)) {
        objects = [objects];
      }

      var change = new Parse.Op.Relation(objects, []);
      this.parent.set(this.key, change);
      this.targetClassName = change._targetClassName;
    },

    /**
     * Removes a Parse.Object or an array of Parse.Object
        objects = [objects];
      }

      var change = new Parse.Op.Relation([], objects);
      this.parent.set(this.key, change);
      this.targetClassName = change._targetClassName;
    },

    /**
     * Returns a JSON version of the object suitable for saving to disk.
     * @return {Object}
     */
    toJSON: function() {
      return { "__type": "Relation", "className": this.targetClassName };
    },

    /**
     * Returns a Parse.Query that is limited to objects in this
     * relation.
     * @return {Parse.Query}
     */
    query: function() {
      var targetClass;
      var query;
      if (!this.targetClassName) {
        targetClass = Parse.Object._getSubclass(this.parent.className);
        query = new Parse.Query(targetClass);
        query._extraOptions.redirectClassNameForKey = this.key;
      } else {
        targetClass = Parse.Object._ge t._toPointer());
      query._addCondition("$relatedTo", "key", this.key);

      return query;
    }
  };
}(this));

(function(root) {
  root.Parse = root.Parse || {};
  var Parse = root.Parse;
  var _ = Parse._;

  /**
   * A Promise is returned by async methods as a hook to provide callbacks to be
   * called when the async task is fulfilled.
   *
   * <p>Typical usage would be like:<pre>
   *    query.findAsync().then(function(results) {
   *      results[0].set("foo", "bar");
   *      return results[0].saveAsync();
   *    }).then(function(result) {
   *      console.log("Updated " + result.id);
   *    });
   * </pre></p>
   *
   * @see Parse.Promise.prototype.next
   * @class
   */
  Parse.Promise = function() {
    this._resolved = false;
    this._rejected = false;
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
  };

  _.extend(Parse.Promise, /** @lends Parse.Promise */ {

    /**
     * Returns true iff the given object fulfils the Promise interface.
     * @return {Boolean}
   */
    is: function(promise) {
      return promise && promise.then && _.isFunction(promise.then);
    },

    /**
     * Returns a new promise that is resolved with a given value.
     * @return {Parse.Promise} the new promise.
     */
    as: function() {
      var promise = new Parse.Promise();
      promise.resolve.apply(promise, arguments);
      return promise;
    },

    /**
     * Returns a new promise that is rejected with a given error.
     * @return {Parse.Promise} the new promise.
     */
    error: function() {
      var promise = new Parse.Promise();
      promise.reject.apply(promise, arguments);
      return promise;
    },

    /**
     * Returns a new promise that is fulfilled when all of the input promises
     * are resolved. If any promise in the list fails, then the returned promise
     * will fail with the last error. If they all succeed, then the returned
   Array} promises a list of promises to wait for.
     * @return {Parse.Promise} the new promise.
     */
    when: function(promises) {
      // Allow passing in Promises as separate arguments instead of an Array.
      var objects;
      if (promises && Parse._isNullOrUndefined(promises.length)) {
        objects = arguments;
      } else {
        objects = promises;
      }

      var total = objects.length;
      var hadError = false;
      var results = [];
      var errors = [];
      results.length = objects.length;
      errors.length = objects.length;

      if (total === 0) {
        return Parse.Promise.as.apply(this, results);
      }

      var promise = new Parse.Promise();

      var resolveOne = function() {
        total = total - 1;
        if (total === 0) {
io.Promise.is(object)) {
          object.then(function(result) {
            results[i] = result;
            resolveOne();
          }, function(error) {
            errors[i] = error;
            hadError = true;
            resolveOne();
          });
        } else {
          results[i] = object;
          resolveOne();
        }
      });

      return promise;
    },

    /**
     * Runs the given asyncFunction repeatedly, as long as the predicate
     * function returns a truthy value. Stops repeating if asyncFunction returns
     * a rejected promise.
     * @param {Function} predicate should return false when ready to stop.
     * @param {Function} asyncFunction should return a Promise.
     */
    _continueWhile: function(predicatlends Parse.Promise.prototype */ {

    /**
     * Marks this promise as fulfilled, firing any callbacks waiting on it.
     * @param {Object} result the result to pass to the callbacks.
     */
    resolve: function(result) {
      if (this._resolved || this._rejected) {
        throw "A promise was resolved even though it had already been " +
          (this._resolved ? "resolved" : "rejected") + ".";
      }
      this._resolved = true;
      this._result = ar" +
															  (this._resolved ? "resolved" : "rejected") + ".";
															  }
														      this._rejected = true;
														      this._error = error;
														      Parse._arrayEach(this._rejectedCallbacks, function(rejectedCallback) {
															      rejectedCallback(error);
															  });
														      this._resolvedCallbacks = [];
														      this._rejectedCallbacks = [];
														  },

    /**
     * Adds callbacks to be called when this promise is fulfilled. Returns a new
     * Promise that will be fulfilled when the callbackte, then
     * the promise returned by "then" with be resolved successfully. If
     * rejectedCallback is null, or it returns a rejected Promise, then the
     * Promise returned by "then" will be rejected with that error.
     * @return {Parse.Promise} A new Promise that will be fulfilled after this
     * Promise is fulfilled and either callback has completed. If the callback
     * returned a Promise, then this Promise will not be fulfilled until that
     * one is.
     */
														  then: function(resolvedCallback, rejectedCallback) {
														      var promise = new Parse.Promise();

														      var wrappedResolvedCallback = functi       promise.resolve.apply(promise, result);
														  }
													      };

													      var wrappedRejectedCallback = function(error) {
														  var result = [];
														  if (rejectedCallback) {
														      result = [rejectedCallback(error)];
														      if (result.length === 1 && Parse.Promise.is(result[0])) {
															  result[0].then(function() {
																  promise.resolve.apply(promise, arguments);
															      }, function(error) {
																  promise.reject(error);
															      });
														      } else {
															  // A Promises/A+ compliant implementation would call:
															  // pedRejectedCallback);
														      }

														      return promise;
														  },

														  /**
														   * Run the given callbacks after this promise is fulfilled.
														   * @param optionsOrCallback {} A Backbone-style options callback, or a
														   * callback function. If this is an options object and contains a "model"
														   * attributes, that will be passed to error callbacks as the first argument.
														   * @param model {} If truthy, this will be passed as the first result of
														   * error callbacks. This is for Backbone-compatability.
														   * @return {Parse.Promise} A promise that will be resolved after the
														   * callbacks are run, with the same result as this.
     options = _.clone(optionsOrCallback);
      }
      options = options || {};

      return this.then(function(result) {
        if (options.success) {
          options.success.apply(this, arguments);
        } else if (model) {
          // When there's no callback, a sync event should be triggered.
          model.trigger('sync', model, result, options);
        }
        return Parse.Promise.as.apply(Parse.Promise, arguments);
      }, function(error) {
        if (options.error) {
          if (!_.isUndefined(model)) {
            options.error(model, error);
          } else {
  callback function that should be called regardless of whether
  * this promise failed or succeeded. The callback will be given either the
  * array of results for its first argument, or the error as its second,
  * depending on whether this Promise was rejected or resolved. Returns a
  * new Promise, like "then" would.
  * @param {Function} continuation the callback.
  */
														  _continueWith: function(continuation) {
														      return this.then(function() {
															      )fromCharCode(48 + (number - 52));
															  }
														      if (number === 62) {
															  return "+";
														      }
														      if (number === 63) {
															  return "/";
														      }
														      throw "Tried to encode large digit " + number + " in base64.";
														  };

														  var encodeBase64 = function(array) {
														      var chunks = [];
														      chunks.length = Math.ceil(array.length / 3);
														      _.times(chunks.length, function(i) {
															      var b1 = array[i * 3];
															      var b2 = array[i * 3 + 1] || 0;
															      var b3 = array[i * 3 + 2] || 0;

															      var has2 = (i * 3 + 1) < array.length;
															      var has3 = (i * 3 + 2) < array.length;

      chunks[i] = [
		   b64Digit((b1 >> 2) & 0x3F),
		   b64Digit(((b1 << 4) & 0x30) | ((b2 >> 4) & 0x0F)),
		   has2 ? b64Digit(((b2 << 2) & 0-the-file-signature
				    var mimeTypes = {
					ai: "application/postscript",
					aif: "audio/x-aiff",
					aifc: "audio/x-aiff",
					aiff: "audio/x-aiff",
					asc: "text/plain",
					atom: "application/atom+xml",
					au: "audio/basic",
					avi: "video/x-msvideo",
					bcpio: "application/x-bcpio",
					bin: "application/octet-stream",rocessingml." +
          "template",
    docm: "application/vnd.ms-word.document.macroEnabled.12",
    dotm: "application/vnd.ms-word.template.macroEnabled.12",
    dtd: "application/xml-dtd",
    dv: "video/x-dv",
    dvi: "application/x-dvi",
    dxr: "application/x-director",
    eps: "application/postscript",
    etx: "text/x-setext",
    exe: "application/octet-stream",
    ez: "application/andrew-inset",
    gif: "image/gif",
    gram:  latex: "application/x-latex",
    lha: "application/octet-stream",
    lzh: "application/octet-stream",
    m3u: "audio/x-mpegurl",
    m4a: "audio/mp4a-latm",
    m4b: "audio/mp4a-latm",
    m4p: "audio/mp4a-latm",
    m4u: "video/vnd.mpegurl",
    m4v: "video/x-m4v",
    mac: "image/x-macpaint",
    man: "application/x-troff-man",
    mathml: "application/mathml+xml",
    me: "applic  pgm: "image/x-portable-graymap",
					pgn: "application/x-chess-pgn",
					pic: "image/pict",
					pict: "imagex-pn-realaudio",
					ram: "audio/x-pn-realaudio",
					ras: "image/x-cmu-raster",
					rdf: "application/rdf+xml",
					rgb: "image/x-rgb",
					rm: "application/vnd.rn-realmedia",
					roff: "application/x-troff",
					rtf: "text/rtf",
					rtx: "text/richtext",
					sgm: "text/sgml",
					sgml: "text/sgml",
					sh: "application/x-sh",
					shar: "application/x-shar",
					silo: "model/mesh",
					sit: "application/x-stuffit",
    skd: /x-texinfo",
    texinfo: "application/x-texinfo",
    tif: "image/tiff",
    tiff: "image/tiff",
    tr: "application/x-troff",
    tsv: "text/tab-separated-values",
    txt: "text/plain",
    ustar: "application/x-ustar",
    vcd: "application/x-cdlink",
    vrml: "model/vrml",
    vxml: "application/voicexml+xml",
    wav: "audio/x-wav",
    wbmp: "image/vnd.wap.wbmp",
    wbmxl: "application/vnd.wap.wbxml",
    wml: "text/vnd.wap.wml",
    wmlc: "application/vnd.wap.wmlc",
    wmls: "text/vnd.wap.wmlscript",
    wmlsc: "application/vnd.wap.wmlscriptc",
    wrl: "model/vrml",
    xbm: "image/x-xbitmap",
    xht: "application/xhtml+xml",
    xhtml: "application/xhtml+xml",
 acroEnabled.12",
					xltm: "application/vnd.ms-excel.template.macroEnabled.12",
					xlam: "application/vnd.ms-excel.addin.macroEnabled.12",
					xlsb: "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
					xslt: "application/xslt+xml",
					xul: "application/vnd.mozilla.xul+xml",
					xwd: "image/x-xwindowdump",
					xyz: "chemical/x-xyz",
    zip: "application/zip"
				    };

				    /**
				     * Reads a File using a FileReader.
				     * @param file {File} the File to read.
				     * @param type {String} (optional) the mimetype to override with.
				     * @return {Parse.Promise} A Promise that will be fulfilled with a
				     *     base64-encoded string of the data and its mime type.
				     */
				    var readAsync = function(file, type) {
					var promise = new Parse.Promise();

					if (typeof(FileReader) === "undefined") {
					    return Parse.Promise.error(new Parse.Error(
										       -1, "Attempted to use a FileReader on an unsupported browser."));
					}te !== 2) {
					promise.reject(new Parse.Error(-1, "Error reading        For example:<pre>
   * var fileUploadControl = $("#profirce = Parse.Promise.as(encodeBase64(data), guessedType);
								       } else if (data && data.base64) {
							   this._source = Parse.Promise.as(data.ba @return {Parse.Promise} Promise that is resolved when the save finishes.
     */
											   save: function(options) {
											       var self = this;
											       if (!self._previousSave) {
												   self._previousSave = self._source.then(function(base64, type) {
      l this method directly.  It is recommended that
      * you use a subclass of <code>Parse.Object</code> instead, created by calling
   * <code>extend</code>.</p>
   *
      * <p>However, if you don't want to use a subclass, or aren't sure which
      * subclass is appropriate, you can use this form:<pre>
      *     var object = new Parse.Object("ClassName");
   * </pre>
   * That is basically equivalent to:<pre>
      *     var MyClass = Parse.Object.extend("ClassName");
      *     var object = new MyClass();
      * </pre>    if (_.isString(attributes)) {
	  return Parse.Object._create.apply(this, arguments);
      }

      attributes = attributes || {};
      if (options && options.parse) {
	  attributes = this.parse(attributes);
      }
      var defaults = Parse._getValue(this, 'defaults');
      if (defaults) {
	  attributes = _.extend({}, defaults, attributes);
      }
      if (options && options.collection) {
	  this.collection = options.collection;
      }

      this._serverData = {};  // The last known data for this object from cloud.
      this._opSetQueue = [{}];  // List of sets of changes to the data.
      this.attributes = {};  // The best estimate of this's current data.

      this._hashedJSON = {};  // Hash of values of containers at last save.
      this._escapedAttributes = {};
      thhis._silent = {};
      this._pending = {};
      this._hasData = true;
      this._previousAttributes = _.clone(this.attributes);
      this.initialize.apply(this, arguments);
      };

												       /**
													* @lends Parse.Object.prototype
													* @property {String} id The objectId of the Parse Object.
													*/

												       /**
													*
													* @param {Array} list A list of <code>Parse.Object</code>.
													* @param {Object} opjson, function(val, key) {
        json[key] = Parse._encode(val, seenObj   return;
      }
      self._refreshingCache ).length > 0) {
       Parse.Relation(this, attr);
      }
    },

    /*ject.
												       */
												       _mergeMagicFiexample,
     * if you do:
		  *   object.set("foo", "bar"he server.
     */
				 _finishSave: function(serverData) {
				     // Grab a copy of any object referenced by this object. These instances
   placing their values with the previously observed values.
   var fetched = Parse._traverse(self._serverData[key], function(object) {
	   if (object instanceof Parse.Object && fetchedObjects[object.id]) {
	       return fetchedObjects[object.id];
	   }
       });
   if (fetched) {
       self._serverData[key] = fetched;
   }
				 });
												       this._rebuildAllEstimatedData();
												       this._saving = this._saving - 1;
												       },

												       /**
													* Called when a fetch or login is complete to set the known server data to
													* the given object.
  timatedData();

      // Clear out the cache of mutable contai json) {
          this._hashedJSON[key] = json;
          rhe local changes that have been made since
	  * then.
	  */
   ng
     * <code>"change"</code> un.Error
     */
												       set: function(key, value, // See if this change will actuan attribute from the modelement.
     *
														     * @param att.rs = arg1;
														     options = arg2;
														     } else {
												       attrs = {};
												       attrs[arg1] = arg2;
												       options = arg3;
												   }

												   // Makees);
											       }

											       var setOptions = _.clone(options) || {};
											       if (setOptions.wait) {
												   setOptions.silent = true;
											       }
											       var setError;
											       setOptions.error = function(model, error) {
												   setError = error;
											       };
											       if (attrs && !this.set(attrs, setOptions)) {
												   return Parse.Promise.error(setError)._thenRunCallbacks(options, this);
											       }

											       var model = this;

											       // If there is any unsaved child, save it first.
											       model._refreshCache();

      

											       var unsavedChildren = [];
											       var unsavedFiles = [];
											       Parse.Object._findUnsavedChildren( });
											   }

							   this._startSave();
							   this._saving = (this._saving || 0) + 1;

							   this._allPreviousSaves = this._allPreviousSaves || Parse.Promise.as();
							   this._allPreviousSaves = this._allPreviousSaves._continueWith(function() {
								   var method = model.id ? 'PUT' : 'POST';

								   var json = model._getSaveJSON();

								   var route = "classes";
								   var className = model.className;
								   if (model.className === "_User" && !model.id) {
								       // Special-case user sign-up.
								       route = "users";
								       className = null;
								   }
								   var request = Parse._request(route, className, model.id, method, json);

								   request = request.then;

							       }, function(error) {
								   model._cancelSave();
								   return Parse.Promise.error(error);

							       })._thenRunCallbacks(options, model);

							   return request;
							   });
					return this._allPreviousSaves;
					},

				    /**
				     * Destroy this model on the server if it was already persisted.
				     * Optimistically removes the model from its collection, if it has one.
				     * If `wait: true` is passed, waits for the server to respond
				     * before removal.
				     *
  urn request.then(function() {
        if (options.wait) {
          triggerDestroy();
        }
        return model;
      })._thenRunCallbacks(options, this);
    },

    /**
    * Converts a response into the hash of attributes to be set on the model.
    * @ignore
    */
				    parse: function(resp, status, xhr) {
					var output = _.clone(resp);
					_(["createdAt", "updatedAt"]).each(function(key) {
						if (output[key]) {
						    output[key] = Parse._parseDate(output[key]);
						}
					    });
					if (!output.updatedAt) {
					    output.updatedAt = output.createdAt;
					}
					if (status) {
					    this._existed = (status tructor(th     return !this.id;
									    },

							     /**
							      * Call this method to manually fire a `"change"` event for this model and
							      * a `"change:attribute"` event for each changed attribute.
							      * Calling this will cause all objects observing the model to update.
							      */
							     change: function(options) {
								 options = options || {};
								 var changing = this._changing;
								 this._changing = true;

								 // Silent changes become pending changes.
								 var self = this;
								 Parse._objectEach(this._silent, funct    if (!self._pending[attr] && !self._silent[attr]) {
									 delete self.changed[attr];
								     }
								     };

								 // Continue firing `"change"` events while there are pending changes.
								 while (!_.isEmpty(this._pending)) {
								     this._pending = {};
								     this.trigger('change', this, options);
								     // Pending and silent changesttr * @return {Boolean}
     */
									 hasChanged: function(attr) {
									 if (!arguments.length) {
									     return !_.isEmpty(this.changed);
									 }
									 return this.changed && _.has(this.changed, attr);
								     },

									 /**
									  * Returns an object containing all the attributes that have changed, or
									  * false if there are no changed attributesd;
    },

    /**
    * Gets the previous value of an attribute, recorded at the time the last
    * <code>"change"</code> event was fired.
    * @param {String} attr Name of the attribute to get.
    */
									 previous: function(attr) {
									 if (!arguments.length || !this._previousAttributes) {
									     return null;
									 }
									 return this._previousAttributes[attr];
  can override this method
      * to , this.attributes, attrs);
								     var error = this.validate(attrs, options);
								     if (!error) {
									 return true;
								     }
								     if (options && og.
   */
									 Parse.Object._getSubclass = function(className) {
									     if (!_.isString(className)) {
										 throw "Parse.Object._getSubclass requires a string argument.";
									     }
									     var ObjectClass = Parse.Object._classMap[className];
									     if (!ObjectClass) {
										 ObjectClass = Parse.Object.extend(className);
										 Parse.Object._classMap[className] = ObjectClass;
									     }
									     return ObjectClass;
									 };

									 /**
									  * Creates an instance of a subclass of Parse.Object for the given classname.
									  */
									 Parse.Object._create = function(clacnt
   * previous extension of that class. When a Parse.Object is automatically
													 * created by parsing JSON, it will use the most recent extension of that
   * class.</p>
   *
   * <p>You should call either:<pre>
													 *     var MyClass = Parse.Object.extend("MyClass", {
   *         <i>Instance properties</i>
   *     }, {
   *         <i>Class properties</i>
   *     });</pre>
													 * or, for Backbone compatibility:<pre>
													 *     var MyClass = Parse.Object.extend({
														 *         className: "MyClass",
														 *         <i>Other instancesName, protoProps, classProps) {
														 // Handle the case with only two args.
														 if (!_.isString(className)) {
														     if (className && _.has(className, "className")) {
															 return Parse.Object.extend(className.className, className, protoProps);
														     } else {
															 throw new Error(
            "Parse.Object.extend's first argumen  NewClassObject = this._extend(protoProps, clnBeSerializedAsValue = function(object) {
    var canBeSerializedAsValue = true;

    if (object instanceof Parse.Object) {
      canBeSerializedAsValue = !!object.id;

    } else if (_.isArray(object)) {
      Parse._arrayEach(object, function(child) {
        if (!Parse.Object._canBeSerializedAsValue(child)) {
          canBeSerializedAsValue = false;
        }
      });

    } else if (_.isObject(object)) {
      Parse._objectEach(object, function(child) {
        if (!Parse.Object._canBeSerializedAsValue(child)) {
          canBeSerializedAsValue = false;
        }
      });
    }

    retildren);
    var remaining =pot in every object's save queue.         };
            })

          }).then(function(response, status, xhr) {
            var error;
            Parse._arrayEach(b  /**
   * Represents a Role on the Parse server. Roles represent groupings of
   * Users for the purr.call(this, null, null);
        this.setName(name);
        this.setACL(acl);
      } else {
        Parse.Object.prototype.constructor.call(this, name, acl);
      }
    },
    
    /**
     * Gets the name of the role.  You can alternatively call role.get("name")
     * 
     * @return {String} the name of the role.
     */
    getName,
    
    /**
     * Gets the Parse.Relation for the Parse.Users that are direct
     * children of this role. These users are granted any privileges that this
     * role has been granted (e.g. read or write access through ACLs). You can
     * add or remove users from the role through this relation.
     * 
     * <p>This is equivalent to calling role.relation("users")</p>
     * 
     * @return {Parse.Relation} the relation for the users belonging to this
     *     role.
     */
    getUsers: function() {
      return this.ing to this
     *     role.
     */
    getRoles: function() {
      return this.relation("roles");
    },
    
    /**
     * @ignore
     */
    validate: function(attrs, options) {
      if ("name" in attrs && attrs.name !== this.getName()) {
        var newName = attrs.name;
        if (this.id && this.id !== attrs.objectId) {
          // Check to see if the objectId being set matches this.id.
          // This happens during a fetch -- the id is set before calling fetch.
          // Let the name be set in this case.
          return new Parse.Error(Parse.Error.OTHER_C    " -, and spaces.");
        }
      }
      if (Parse.Object.prototype.validate) {
        return Parse.Object.prototype.validate.call(this, attrs, options);
      }
      return false;
    }
  });
}(this));


/*global _: false */
(function(root) {
  root.Parse = root.Parse || {};
  var Parse = root.Parse;
  var _ = Parse._;

  /**
   * Creates a new instance with the given models and options.  Typically, you
   * will not call this method directly, but will instead make a subclass using
   * <code>Parse.Collecti   * <p>Provides a standard collection class for our sets of models, ordered
   * or unordered.  For more information, see the
   * <a href="http://documentcloud.github.com/backbone/#Collection">Backbone
   * documentation</a>.</p>
   */
	    Parse.Collection = function(models, options) {
		options = options || {};
		if (options.comparator) {
		    this.comparator = options.comparator;
		}
		if (options.model) {
		    this.model = options.model;
		}
		if (options.query) {
		    this.query = options.query;
		}
		this._reset();
		this.initialize.apply(this, arguments);
		if (models) {
		    this.reset(models, {silent: true, parse: options.parse});
		}
	    }ion by default. Override it with your own
     * initialization logic.
     */
	    initialize: function(){},

	    /**
	     * The JSON representation of a Collection is an array of the
	     * models' attributes.
	     */
	    toJSON: function() {
		return this.map(function(model){ return model.toJSON(); });
	    },

	    /**
	     * Add a model, or list of models to the set. Pass **silent** to avoid
	     * firing the `add` event for every new model.
	     */
	    add: function(modecollection");
        }
        cid = model.cid;
        if (cids[cid] || this._byCid[cid]) {
          throw new Error("Duplicate cid: can't add the same model " +
                          "to a collection twice");
        }
        id = model.id;
        if (!Parse._isNullOrUndefined(id) && (ids[id] || this._byId[id])) {
          throw new Error("Duplicate id: can't add the same model " +
                          "to a collection twice");
        }
        ids[id] = model;
        cids[cid] = model;
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id) {
          this._byId[model.id] = model;
        }
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = Parse._isNullOrUndefined(options.at) ? 
          this.models.length : options.at;
      this.models.splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) {
        this.sort({silent: true});
      }
      if (options.silent) {
        return this;
      }
      for (i = 0, length = this.models.length; i < length; i++) {
        model = this.models[i];
        if (cids[model.cid]) {
          options.index = i;
          model.trigger('add', model, this, options);
        }
      }
      return this;
    },

    /**
     * Remove a model, or a list of models from the set. Pass silent to avoid
     * firing the <code>remove</code> event for every model removed.
     */
    remove: function(models, options) {
      var i, l, index, model;
      options = options || {};
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) {
          continue;
        }
       delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    /**
     * Gets a model from the set by id.
     */
    get: function(id) {
      return id && this._byId[id.id || id];
    },

    /**
     * Gets a model from the set by client id.
     */
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    /**
     * Gets the model at the given index.
     */
    at: function(index) {
      return this.models[index];
    },

    /**
     * Forces the collection to re-sort itself. You don't need to call this
     * under normal circumstances, as the set will maintain sort order as each
     * item is added.
     */
    sort: function(options) {
s || {};
      if (!this.comparator) {
        throw new Error('Cannot sort a set without a comparator');
      }
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length === 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) {
        this.trigger('reset', this, options);
      }
      return this;
    },

    /**
     * Plucks an attribute from each model in the collection.
     */
    pluck: function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    /**
     * When you have more iels, function(model) {
        self._removeReference(model);
      });
      this._reset();
      this.add(models, {silent: true, parse: options.parse});
      if (!options.silent) {
        this.trigger('reset', this, options);
      }
      return this;
    },

    /**
     * Fetches the default set of models for this collection, resetting the
     * collection when they arrive. If `add: true` is passw instance of a model in this collection. Add the model to
     * the collection immediately, unless `wait: true` is passed, in which case
     * we wait for the server to agree.
     */
    create: function(model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) {
        return false;
      }
      if (!options.wait) {
        coll.add(model, options);
      }
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        if (options.wait) {
          coll.add(nextModel, options);
        }
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    /**
     * Converts a response into a list of models to be added to the collection.
     * The default implementation is just to pass it through.
     * @ig*/
    parse: function(resp, xhr) {
      return resp;
    },

    /**
     * Proxy to _'s chain. Can't be proxied the same way the rest of the
     * underscore methods are proxied because it relies on the underscore
     * constructor.
     */
    chain: function() {
      return _(this.models).chain();
    },

    /**
     * Reset all internal state. Called when the collection is reset.
     */
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    /**
     * Prepare a model or hash of attributes to be added to this collection.
     */
    _prepareModel: function(model, options) {
      if (!(model instanceof Parse.Object)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) {
          model = false;
        }
      } else if (!model.collection) {
        model.collection = t    },

    /**
     * Internal method to remove a model's ties to a collection.
     */
    _removeReference: function(model) {
      if (this === model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    /**
     * Internal method called every time a model in the set fires an event.
     * Sets need to update their indexes when models change ids. All other
     * events simply proxy through. "add" and "remove" events that originate
     * in other collections are ignored.
     */
    _onModelEvent: function(ev, model, collection, options) {
      if ((ev === 'add' || ev === 'remove') && collection !== this) {
        return;
      }
      if (ev === 'destroy') {
        this.remove(model, options);
      }
      if (model && ev === 'change:objectId') {
        delete this._byId[model.previous("objectId")];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  } to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  Parse._arrayEach(methods, function(method) {
    Parse.Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  /**
   * Creates a new subclass of <code>Parse.Collection</code>.  For example,<pre>
   *   var MyCollection = Parse.Collection.extend({
   *     // Instance properties
   *
   *     model: MyClass,
   *     query: MyQuery,
   *
   *     getFirst: function() {
   *       return this function() {
   *       return new MyCollection();
   *     }
   *   });
   *
   *   var collection = new MyCollection();
   * </pre>
   *
   * @function
   * @param {Object} instanceProps Instance properties for the collection.
   * @param {Object} classProps Class properies for the collection.
   * @return {Class} A new subclass of <code>Parse.Collection</code>.
   */
  Parse.Collection.extend = Parse._extend;

}(this));

/*global _: false, document: false */
(function(root) {
  root.Parse = root.Parse || {};
  var Parse = root.Parse;
  var _ = Parse._;

  /**
   * Creating a Parse.View creates its initial element outside of the DOM,
   * if an existing element is not prov</a>.</p>
   * <p><strong><em>Available in the client SDK only.</em></strong></p>
   */
  Parse.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var eventSplitter = /^(\S+)\s*(.*)$/;

  // List of vs.$el.find(selector);
    },

    /**
     * Initialize is an empty function by default. Override it with your own
     * initialization logic.
     */
    initialize: function(){},

    /**
     * The core function that your view should override, in order
     * to populate its element (`this.el`), with the appropriate HTML. The
     * convention is for **render** to always return `this`.
     */
    render: function() {
      return this;
    },

    /**
     * Remove this view from the DOM. Note that the view isn't present in the
     * DOM by default, so calling this method may be a no-op.
     */
    remove: function() {
      this.$el.remove();
      return this;
    },

    /**
     * For small amounts of DOM Elements, where a full-blown template isn't
     * needed, use **make** to manufacture elements, one at a time.
     * <pre>
     *     var el = this.make('li', {'clat) {
      var el = document.createElement(tagName);
      if (attributes) {
        Parse.$(el).attr(attributes);
      }
      if (content) {
        Parse.$(el).html(content);
      }
      return el;
    },

    /**
     * Changes the view's element (`this.el` property), including event
     * re-delegation.
     */
    setElement: function(element, delegate) {
      this.$el = Parse.$(element);
      this.el = this.$el[0];
      if (delegate !== false) {
        this.delegateEvents();
      }
      return this;
    },

    /**
     * Set callbacks.  <code>this.events</code> is a hash of
     * <pre>
     * *{"event selector": "callback"}*
     *
     *     {
     *       'mousedown .title':  'edit',
     *       'click .button':     'save'
     *       'click .open':       function(e) { ... }
This only works for delegate-able events: not `focus`, `blur`, and
     * not `change`, `submit`, and `reset` in Internet Explorer.
     */
    delegateEvents: function(events) {
      events = events || Parse._getValue(this, 'events');
      if (!events) {
        return;
      }
      this.undelegateEvents();
      var self = this;
      Parse._objectEach(events, function(method, key) {
        if (!_.isFunction(method)) {
          method = self[events[key]];
        }
        if (!method) {
          throw new Error('Event "' + events[key] + '" does not exist');
        }
        var match = key.match(eventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bindelegateEvents`.
     * You usually don't need to use this, but may wish to if you have multiple
     * Backbone views attached to the same DOM element.
     */
    undelegateEvents: function() {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    /**
     * Performs the initial configuration of a View with a set of options.
     * Keys with special meaning *(model, collection, id, className)*, are
     * attached directly to the view.
     */
    _configure: function(options) {
      if (this.options) {
        options = _.extend({}, this.options, options);
      }
      var self = this;
      _.each(viewOptions, function(attr) {
        if (options[attr]) {
          self[attr] = options[attr];
        }
      });
      this.options = options;
    },

  sName` and `tagName` properties.
     */
    _ensureElement: function() {
      if (!this.el) {
        var attrs = Parse._getValue(this, 'attributes') || {};
        if (this.id) {
          attrs.id = this.id;
        }
        if (this.className) {
          attrs['class'] = this.className;
        }
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  /**
   * @function
   * @param {Object} instanceProps Instance properties for the view.
   * @param {Object} classProps Class properies for the view.
   * @return {Class} A new subclass of <code>Parse.Via Parse.Object, but also extends it with various
   * user specific methods, like authentication, signing up, and validation of
   * uniqueness.</p>
   */
  Parse.User = Parse.Object.extend("_User", /** @lends Parse.User.prototype */ {
    // Instance Variables
    _isCurrentUser: false,


    // Instance Methods

    /**
     * Internal method to handle special fields in a _User response.
     */
    _mergeMagicFields: function(attr       delete authData[key];
        }
      });
    },

    /**
     * Synchronizes authData for all providers.
     */
    _synchronizeAllAuthData: function() {
      var authData = this.get('authData');
      if (!authData) {
        return;
      }

      var self = this;
      Parse._objectEach(this.get('authData'), function(value, key) {
        self._synchronizeAuthData(key);
      });
    },

    /**
     * Synchronizes auth data for a provider (e.g. puts the access token in the
     * right place to be used by the Facebook SDK).
     */
    _synchronizeAuthData: function(provider) {
      if (!this.isCurrent()) {
        return;
      }
      var authTythType]);
      if (!success) {
        this._unlinkFrom(provider);
      }
    },

    _handleSaveResult: function(makeCurrent) {
      // Clean up and synchronize the authData object, removing any unset values
      if (makeCurrent) {
        this._isCurrentUser = true;
      }
      this._cleanupAuthData();
      this._synchronizeAllAuthData();
      // Don't keep the password around.
      delete this._serverData.password;
      this._rebuildEstimatedDataForKey("password");
      this._refreshCache();
      if (makeCurrent || this.isCurrent()) {
        Parse.User._saveCurrentUser(this);
      }
hType();
      }
      if (_.has(options, 'authData')) {
        var authData = this.get('authData') || {};
        authData[authType] = options.authData;
        this.set('authData', authData);

        // Overridden so that the user can be made the current user.
        var newOptions = _.clone(options) || {};
        newOptions.success = function(model) {
          model._handleSaveResult(true);
          if (options.success) {
            options.success.apply(this, arguments);
          }
        };
        return this.save({'authData': authData}, newOptions);
      } else {
        var self 
            if (options.error) {
              options.error(self, error);
            }
            promise.reject(error);
          }
        });
        return promise;
      }
    },

    /**
     * Unlinks a user from a service.
     */
    _unlinkFrom: function(provider, options) {
      var authType;
      if (_.isString(provider)) {
        authType = provider;
        provider = Parse.User._authProviders[provider];
      } else {
        authType = provider.getAuthType();
      }
      var newOptions = _.clone(options);
      ider;
      } else {
        authType = provider.getAuthType();
      }
      var authData = this.get('authData') || {};
      return !!authData[authType];
    },

    /**
     * Deauthenticates all providers.
     */
    _logOutWithAll: function() {
      var authData = this.get('authData');
      if (!authData) {
        return;
      }
      var self = this;
      Pars on the server, and
     * also persist the session on disk so that you can access the user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling signUp.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @param {Object} attrs Extra fields to set on the new user, or null.
     * @param {Object} options A Backbone-style options object.
     * @return {Parse.Promise} A promise that is fulfilled when the signup
        }

      var password = (attrs && attrs.password) || this.get("password");
      if (!password || (password === "")) {
        error = new Parse.Error(
            Parse.Error.OTHER_CAUSE,
            "Cannot sign up user with an empty password.");
        if (options && options.error) {
          options.error(this, error);
        }
        return Parse.Promise.error(error);
      }

      // Overridden so that the user can be made the current user.
      var newOptions = _.clone(options);
      newOptions.success = function(model) {
        model._handleSaveResult(true);
        if (options.success) {
          options.success.apply(this, arguments);
        }
      };
      return this.save(attrs, newOptions);
  ions.success or options.error on completion.</p>
     *
     * @param {Object} options A Backbone-style options object.
     * @see Parse.User.logIn
     * @return {Parse.Promise} A promise that is fulfilled with the user when
     *     the login is complete.
     */
    logIn: function(options) {
      var model = this;
      var request = Parse._request("login", null, null, "GET", this.toJSON());
      return request.then(function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, status, xhr);
        model._finishFetch(serverAttrs);
        model._handleSaveResult(true);
        return model;
      })._thenRunCallbacks(options, this);
    },

    /**
     * @ses = options || {};

      var newOptions = _.clone(options);
      newOptions.success = function(model) {
        model._handleSaveResult(false);
        if (options.success) {
          options.success.apply(this, arguments);
        }
      };
      return Parse.Object.prototype.save.call(this, attrs, newOptions);
    },

    /**
     * @see Parse.Object#fetch
     */
    fetch: function(options) {
      var newOptions = options ? _.clone(options) : {};
      newOptions.success = function(model) {
        model._handleSaveResult(false);
       sername: function() {
      return this.get("username");
    },

    /**
     * Calls set("username", username, options) and returns the result.
     * @param {String} username
     * @param {Object} options A Backbone-style options object.
     * @return {Boolean}
     * @see Parse.Object.set
     */
    setUsername: function(username, options) {
      return this.set("username", username, options);
    },

    /**
     * Calls sil
     * @param {Object} options A Backbone-style options object.
     * @return {Boolean}
     * @see Parse.Object.set
     */
    setEmail: function(email, options) {
      return this.set("email", email, options);
    },

    /**
     * Checks whether this user is the current user and has been authenticated.
     * @return (Boolean) whether this user is the current user and is logged in.
     */
    authentir",

    // The mapping of auth provider names to actual providers
			  _authProviders: {},


    // Class Methods

    /**
     * Signs up a new user with a username (or email) and password.
     * This will create a new Parse.User on the server, and also persist the
     * session in localStorage so that you can access the user using
     * {@link #current}.
     *
     * <p>Calls options.success or opti = Parse.Object._create("_User");
      return user.signUp(attrs, options);
    },

    /**
    * Logs in a user with a username (or email) and password. On success, this
    * saves the session to disk, so you can retrieve the currently logged in
    * user using <code>current</code>.
    *
    * <p>Calls options.success or options.error on completion.</p>
    *
    * @param {String} username The username (or email) to log in with.
    * @param {String} password The from disk, log out of linked services, and future calls to
    * <code>current</code> will return <code>null</code>.
    */
			  logOut: function() {
			      if (Parse.User._currentUser !== null) {
				  Parse.User._currentUser._logOutWithAll();
				  Parse.User._currentUser._isCurrentUser = false;
			      }
			      Parse.User._currentUserMatchesDisk = true;
			      Parse.User._currentUser = null;
			      Parse.localStorage.removeItem(
							    Parse._getParsePath(Parse.User._CURRENT_USER_KEY));
			  },

    /**
     * Requests a password reset email to be sent to the speciuser il, options) {
      var json = { email: email };
      var request = Parse._request("requestPasswordReset", null, null, "POST",
                                   json);
      return request._thenRunCallbacks(options);
    },

    /**
    * Retrieves the currently logged in ParseUser with a valid session,
    * either from memory or localStorage, if necessary.
    * @return {Parse.Object} The currently logged in Parse.User.
    */
			  current: functionurrentUser = true;

			  var json = JSON.parse(userData);
			  Parse.User._currentUser.id = json._id;
			  delete json._id;
			  Parse.User._currentUser._sessionToken = json._sessionToken;
			  delete json._sessionToken;
			  Parse.User._currentUser.set(json);

			  Parse.User._currentUser._synchronizeAllAuthData();
			  Parse.User._currentUser._refreshCache();
			  Parse.User._currentUser._opSetQueue = [{}];
			  return Parse.User._currentUser;
			  },

    /**
     * Persists a user as currentUser tringify(json));
    },

    _registerAuthenticationProvider: function(provider) {
      Parse.User._authProviders[provider.getAuthType()] = provider;
      // Synchronize the current user with the auth provider.
      if (Parse.User.current()) {
        Parse.User.current()._synchronizeAuthData(provider.getAutode> method. For example, this sample code fetches all objects
   * of class <code>MyClass</code>. It calls a different function depending on
   * whether the fetch succeeded or not.
   * 
   * <pre>
   * var query = new Parse.Query(MyClass);
   * query.find({
   *   success: function(results) {
   *     // results is an array of Parse.Object.
   *   },
   *
   *   error: function(error is an instance of Parse.Error.
   *   }
   * });</pre></p>
   * 
   * <p>A Parse.Query can also be used to count the number of objects that match
   * the query without retrieving all of those objects. For example, this
   * sample code counts the number of objects of the class <code>MyClass</code>
   * uery that is the OR of the passed in queries.  For
   * example:
   * <pre>var compoundQuery = Parse.Query.or(query1, query2, query3);</pre>
   *
   * will create a compoundQuery that is an or of the query1, query2, and
   * query3.
   * @param {...Parse.Query} var_args The list of queries to OR.
   * es.
     *
     * @param {} objectId The id of the object to be fetched.
     * @param {Object} options A Backbone-style options object.
     */
	    get: function(objectId, options) {
																	     var self = this;
																	     self.equalTo('objectId', objectId);

																	     return self.first().then(function(response) {
																		     if (response) {
																			 return response;
																		     }

																		     var errorObject = new Parse.Error(Parse.Error.OBJECT_NOT_F}
																			 if (this._skip > 0) {
																			     params.skip = this._skip;
																			 }
																		     if (this._order !== undefined) {
																			 params.order = this._order;
																		     }

																		     Parse._objectEach(this._extraOptions, function(v, k) {
																			     params[k] = v;
																			 });

																		     return params;
																		 },

																		 /**
																		  * Retrieves a list of ParseObjects that satisfy this query.
																		  * Either options.success or options.error is called when the find
																		  * completes.
																		  *
																		  * @param {Object} options A Backbone-style options object.
																		  * @return {Parse.Promise} A promise that is resolved with the results when
																		  * the query completes.
																		  */
																		 find: function(options) {
																		     var self = this;

																		     var request = Parse._request("classes", this.className, null, "GET",
																						  this.toJSON());

																		     return request.then(function(          } else {
																			     obj = new self.objectClass();
																			 }
																			 obj._finishFetch(json, true);
																			 return obj;
																			 });
																		 })._thenRunCallbacks(options);
	    },

															 /**
     * Counts the number of objects that match this query.
     * Either options.success or options.error is called when the count
     * completes.
     *
     * @param {Object} options A Backbone-style options object.
     * @return {Parse.Promise} A promise that is resolved with the count when
     * the query completes.
     */
    count: fucalled when it completes.
															 * success is passed the object if there is one. otherwise, undefined.
     *
															 * @param {Object} options A Backbone-style options object.
															 * @return {Parse.Promise} A promise that is resolved with the object when
     * the query completes.
															 */
															 first: function(options) {
															     var self = this;

															     var params = this.toJSON();
															     params.limit = 1;
															     var request = Parse._request("classes", this.className, null, "GET",
																			  params);

															     return request.then(functi, _.extend(options, {
																	 model: this.objectClass,
        query: this
																	     }));
															 },

															 /**
															  * Sets the number of results to skip before returning any results.
															  * This is useful for pagination.
															  * Default is to skip zero results.
															  * @param {Number} n the number of results to skip.
															  * @return {Parse.Query} Returns the query, so you can chain this call.
															  */
															 skip: function(n) {
     value The value that the Parse.Object must contain.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
     equalTo: function(key, value) {
	 this._where[key] = Parse._encode(value);
	 return this;
     },

     /**
      * Helper for condition queries
      */
     _addCondition: function(key, condition, value) {
	 // Check if we already have a condition
	 if (!this._where[key]) {
	     this._where[key] = {};
	 }
	 this._where[key][condition] = Parse._encode(value);
	 return this;
     },

     /**
      * Add a constraint to the query that requires a particular key's value to
      * be not equal to the provided value.
      * @param {String} key The key to check.
  that requires a particular key's value to
  * be less than the provided value.
  * @param {String} key The key to check.
  * @param value The value that provides an upper bound.
  * @return {Parse.Query} Returns the query, so you can chain this call.
  */
     lessThan: function(key, value) {
	 this._addCondition(key, "$lt", value);
	 return this;
     },

     /**
      * Add a constraint to the query that requires a particular key's value to
      * be greater than the provided value.
      * @param {String} key The key to check.
      * @param value The value that provides an lower bound.
      * @return {Parse.Query} Returns the query, so you can chain this call.
      */
     greaterThan: function(key, value that provides an upper bound.
			   * @return {Parse.Query} Returns the query, so you can chain this call.
     */
			   lessThanOrEqualTo: function(key, value) edIn: function(key, values) {
			       this._addCondition(key, "$in", values);
			       return this;
			   },

			   /**
			    * Add a constraint to the query that requires a particular key's value to
			    * not be contained in the provided list of values.
			    * @param {String} key The key to check.
			    * @param {Array} values The values that will not match.
			    * @return {Parse.Query} Returns the query, so you can chain this call.
			    */
			   notContainedIn: function(key, values) {
			       this._addCondition(key, "$nin", valu;
						  },


			       /**
				* Add a constraint for finding objects that contain the given key.
				* @param {String} key The key that should exist.
				* @return {Parse.Query} Returns the query, so you can chain this call.
				*/
			       exists: function(key) {
				   this._addCondition(key, "$exists", true);
				   return this;
			       },

			       /**
				* Add a constraint for finding objects that do not contain a given key.
				* @param {String} key The key that should not exist
				* @return {Parse.Query} Returns the query, so you can chain this call.
				*/
			       doesNotExist query, so you can chain this call.
     */
			       matches: function(key, regex, modifiers) {
				   this._addCondition(key, "$regex", regex);
				   if (!modifiers) { modifiers = ""; }
				   // Javascript regex options support mig as inline options but store them 
				   // as properties of the object. We support mi & should migrate them to
				   // modifiers
				   if (regex.ignoreCase) { modifiers += 'i'; }
				   if (regex.multiline) { modifiers += 'm'; }

				   if (modifiers && modifiers.letoJSON();
				       queryJSON.className = query.className;
				       this._addCondition(key, "$inQuery", queryJSON);
				       return this;
				       },

				       /**
					* Add a constraint that requires that a key's value not matches a
					* Parse.Query constraint.
					* @param {String} key The key that the contains the object to match the
					*                     query.
					* @param {Peturned by the query to
					*                          match against.
					* @param {Parse.Query} query The query to run.
					* @return {Parse.Query} Returns the query, so you can chain this call.
					*/
				       matchesKeyInQuery: function(key, queryKey, query) {
					   var queryJSON = query.toJSON();
					   queryJSON.className = query.className;
					   this._addCondition(key, "$select",
													     { key: queryKey, query: queryJSON });
					   ueryKey The key in the objects returned by the queron(key, queryKey, query) {
					       var queryJSON = query.toJSON();
					       queryJSON.className = query.className;
					       this._addCondition(key, "$dontSelect",
								  { key: queryKey, query: queryJSON });
					       return this;
					   },

					   /**
					    * Add constraint that at least one of the passed in queries matches.
					    * @param {Array} queries
					    * @return {Parse.Query} Returns the query, so you can chain this call.ge datasets.
					    * @param {String} key The key that the string to match is stored in.
					    * @param {String} substring The substring that the value must contain.
					    * @return {Parse.Query} Returns the query, so you can chain this call.
					    */
					   contains: function(key, value) {
					       this._addCondition(key, "$regex", this._quote(value));
					       return this;
					   },

					   /**
					    * Add a constraint for finding string values that start with a provided
					    * string.  This query will use the backend index, so it will be fast even
					    * for large datasets.
					    * @param {String} key The key that the string to match is stored in.
					    * @parang.  This will be slow for large datasets.
					    * @param {String} key The key that the string to match is stored in.
					    * @param {String} suffix The substring that the value must end with.
					    * @return {Parse.Query} Returns the query, so you can chain this call.
					    */
					   endsWith: function(key, value) {
					       this._addCondition(key, "$regex", this._quote(value) + "$");
					       return this;
					   },

					   /**
					    * Sorts the results in ascending order by the given key.
					    * 
					    * @param {String} key The key to order by.
					    * @return {Parse.Query} Returns the query,ximity based constraint for finding objects with key point
					    * values near the point given.
					    * @param {String} key The key that the Parse.GeoPoint is stored in.
					    * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
					    * @return {Parse.Query} Returns the query, so you can chain this call.
					    */
					   near: function(key, point) {
					       if (!(point instanceof Parse.GeoPoint)) {
						   // Try to cast it to a GeoPoint, so that near("loc", [2{Parse.Query} Returns the query, so you can chain this call.
     */
     withinRadians: function(key, point, distance) {
						       this.near(key, point);
						       this._addCondition(key, "$maxDistance", distance);
						       return this;
						   },

     /**
      * Add a proximity based constraint for finding objects with key point
      * values near the point given and within the maximum distance given.
      * Radius of earth used is 3958.8 miles.
      * @param {String} key The key that the Parse.GeoPoint is stored in.
      * @param {Parse.GeoPomaximum distance given.
      * Radius of earth used is 6371.0 kilometers.
      * @param {String} key The key that the Parse.GeoPoint is stored in.
      * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
      * @param {Number} maxDistance Maximum distance (in kilometers) of results
      *     to return.
      * @return {Parse.Query} Returns the query, so you can chain this call.
      */
     withinKilometers: function(key, point, distance) {
						       return this.withinRadians(key, point, distance / 6371.0);
						   },

  call.
     */
     withinGeoBox: function(key, southwest, northeast) {
						       if (!(southwest instanceof Parse.GeoPoint)) {
							   southwest = new Parse.GeoPoint(southwest);
						       }
						       if (!(northeast instanceof Parse.GeoPoint)) {
							   northeast = new Parse.GeoPoint(northeast);
						       }
						       this._addCondition(key, '$within', { '$box': [southwest, northeast] });
						       return this;
						   },

     /**
      * Include nested Parse.Objects for the provided key.  You can use dot
      * notation to specify which fields in the included object are also fetch.
      * @param {String} key The name of the key to include.
      * @return {Parse.Query} Returns the query, so you can chain this call.
      */
     include: function() {
      var se returned Parse.Objects to include only the
      * provided keys.  If this is called multiple times, then all of the keys
     * specified in each of the calls will be included.
      * @param {Array} keys The names of the keys to include.
      * @return {Parse.Query} Returns the query, so you can chain this call.
     */
      select: function() sort order,
     * and may not use limit or skip.
      * @param callback {Function} Callback that will be called with each result
     *     of the query.
      * @param options {Object} An optional Backbone-like options object with
     *     success and error callbacks that will be invoked once the iteration
     *     has finished.
      * @return {Parse.Promise} A promise that will be fulfilled once the
     *     iteration has completed.
     */
      each: function(callback, options) {
	  options = options || {};

	  if (this._order || this._skip || (this._ = _.clone(this._where);
					    query._include = _.clone(this._include);

					    query.ascending('objectId');

					    var finished = false;
					    return Parse.Promise._continueWhile(function() {
						    return !finished;

						}, function() {
						    return query.find().then(function(results) {
							    var callbacksDone = Parse.Promise.as();
							    Parse._.each(results, function(result) {
								    callbacksDone = callbacksDone.then(function() {
									    return callback(result);
									});
								});

							    return callbacksDone.then(function() {
								    if (results.length >= qualized = false;
									var requestedPermissions;
									var initOptions;
									var provider = {
									    authenticate: function(options) {
										var self = this;
										FB.login(function(response) {
											if (response.authResponse) {
											    if (options.success) {
												options.success(self, {
													id: response.authResponse.userID,
													    access_token: response.authResponse.accessToken,
													    expiration_date: new Date(response.authResponse.expiresIn * 1000 +
																      (new Date/ 1000
																       };
																      var newOptions = _.clone(initOptions);
																      newOptions.authResponse = authResponse;

																      // Suppress checks for login status from the browser.
																      newOptions.status = false;
																      FB.init(newOptions);
																      }
													return true;
												    },
												    getAuthType: function() {
													return "facebook";
												    },
												    deauthenticate: function() {   * @param {Object} options Facebook options argument as described here:
     *   <a href=
																			 *   "https://developers.facebook.com/docs/reference/javascript/FB.init/">
													    *   FB.init()</a>. The status flag will be coerced to 'false' because it
																			 *   interferes with Parse Facebook integration. Call FB.getLoginStatus()
     *   explicitly if this behavior is required by your application.
     */
				init: function(options) {
														if (typeof(FB) === 'undefined') {
														    throw "The Facebook JavaScript SDK must be loaded before calling init.";
														} 
														initOptions = _.clone(options) || {};
														if (initOptions.status && typeof(console) !== "undefined") {
														    var warn   }
														initOptions.status = false;
														FB.init(initOptions);
														Parse.User._registerAuthenticationProvider(provider);
														initialized = true;
													    },

																			 /**
																			  * Gets whether the user has their account linked to Facebook.
																			  * 
																			  * @param {Parse.User} user User to check for a facebook link.
																			  *     The user must be logged in on this device.
																			  * @return {Bo REST API docs if you want to handle getting facebook auth tokens
																			  *    yourself.
																			  * @param {Object} options Standard options object with success and error
																			  *    callbacks.
																			  */
																			 logIn: function(permissions, options) {
													    if (!permissions || _.isString(permissionpermissions The permissions required for Facebook
     *    log in.  This is a comma-separated string of permissions. 
																	   *    Alternatively, supply a Facebook authData object as described in our
     *    REST API docs if you want to handle getting facebook auth tokens
     *    yourself.
																	   * @param {Object} options Standard options object with success and error
     *    callbacks.
     */
																	   link: function(user, permissions, options) {
																	       if (!permissions || _.isString(permissions)) {
																		   if (!initialized) {
																		       throw "You must initialize FacebookUtils before calling link.";
																		   }
																		   requestedPermissions = permissions;
																		   return user._linkWith("facebook", options);is must be the
     *     current user.
																								  * @param {Object} options Standard options object with success and error
     *    callbacks.
     */
																											unlink: function(user, options) {
																		       if (!initialized) {
																			   throw "You must initialize FacebookUtils before calling unlink.";
																		       }
																		       return user._unlinkFrom("facebook", options);
																		   }
																	       };
  
																	   }(this));

														/*global _: false, document: false, window: false, navigator: false */
														(function(root) {
														    root.Parse = root.Parse || {};
														    var Parse = root.Parse;
														    var _ = Parse._;

														    is class, you must also include jQuery, or another library 
															* that provides a jQuery-compatible $ function.  For more information,
   * see the <a href="http://documentcloud.github.com/backbone/#History">
   * Backbone documentation</a>.</p>
   * <p><strong><em>Available in the client SDK only.</em></strong></p>
   */
  Parse.History = functiontly due to bug
															// in Firefox where location.hash will always be decoded.
															getHash: function(windowOverride) {
															var loc = windowOverride ? windowOverride.location : window.location;
															var match = loc.href.match(/#(.*)$/);
															return match ? match[1] : '';
														    },

															// Get the cross-browser normalized URL fragment, either from the URL,
															// the hash, or the override.
															getFragment: function(fragment, forcePushState) {
															if (Parse.he current
															    * URL matches an existing route, and `false` otherwise.
     */
															    start: function(options) {
																if (Parse.History.started) {
																    throw new Error("Parse.history has already been started");
																}
																Parse.History.started = true;

																// Figure out the initial configuration. Do we need an iframe?
																// Is pushState desired ... is it available?
																this.options = _.extend({}, {root: '/'}, this.options, options);
																this._wantsHashChange = this.options.hashChange !== false;
																this._wantsPushState = !!this.options.pushState;
																this._hasPushState = !!(this.options.pushState && 
             -1" />')
                      .hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Parse.$(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange &&
                 ('onhashchange' in window) &&
                 !oldIE) {
  led browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && 
          this._wantsPushState && 
          !this._hasPushState &&
          !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root .history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Parse.$(window).unbind('popstate', this.checkUrl)
                     .unbind('hashchange', this.checkUrl);
      window.clearInterval(this._checkUrlInterval);
      Parse.History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
      }
      if (!this.loadUrl()) {
        this.loadUrl(this.getHash());
      }
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          retu   // history.
    navigate: function(fragment, options) {
      if (!Parse.History.started) {
        return false;
      }
      if (!options || options === true) {
        options = {trigger: options};
      }
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment === frag) {
        return;
      }

      // If pushState is available, we use it to set the fragment a this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier
          // to push a history entry on hash-tag change.
          // W);
      } else {
        location.hash = fragment;
      }
    }
  });
}(this));

/*global _: false*/
(function(root) {
  root.Parse = root.Parse || {};
  var Parse = root.Parse;
  var _ = Parse._;

  /**
   * Routers map faux-URLs to actions, and fire events when routes are
   * matched. Creating a new one sets its `routes` hash, if not set statically.
   * @class
   *
   * <p>A fork of Backbone.Router, provided for your convenience.
   * For more information, see the
   * <a href="http://documentcloud.github.com/backbone/#Router">Backbone
   * documentation</a>.</p>
																			* <p><strong><em>Available in tw+/g;
																			var escapeRegExp  = /[\-\[\]{}()+?.,\\\^\$\|#\s]/g;

																			// Set up all inheritable **Parse.Router** properties and methods.
																			_.extend(Parse.Router.prototype, Parse.Events,
																				 /** @lengs);
        }
        this.trigger.apply(this, ['route:' + name].concat(args));
        Parse.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    /**
    * Whenever you reach a point in your application that you'd
    * like to save as a URL, call navigate in order to update the
    * URL. If you wish to also call the route function, set the 
    * trigger option to true. To updatesOwnProperty(route)) {
          routes.unshift([route, this.routes[route]]);
        }
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matter</code>.
    */
																				 Parse.Router.extend = Parse._extend;
																				 }(this));
(function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;

    /**
     * @namespace Contains functions for calling and declaring
     * <a href="/docs/cloud_code_guide#functions">cloud functions</a>.
     * <p><strong><em>
     *   Some functions are only available from Cloud Code.
     * </em></strong></p>
     */
    Parse.Cloud = Parse.Cloud || {};

    _.extend(Parse.Cloud, /** @lends Parse.Cloud */ {
	    /**
	     * Makes a call to a cloud function.
	     * @param {String} name The function name.
	     * @param {Object} data The parameters to send to the cloud function.
	     * @param {Object} options A Backbone-style options object
	     * options.success, if set, should be a function to handle a successful
	     * call to a cloud function.  options.error should be a function that
	     * handles an error running the cloud function.  Both functions are
	     * optional.  Both functions take a single argument.
	     * @return {Parse.Promise} A promise that will be resolved with the result
	     * of the function.
	     */
	    run: function(name, data, options) {
		var request = Parse._request("functions", name, null, 'POST',
					     Parse._encode(data, null, true));

		return request.then(function(resp) {
			return Parse._decode(null, resp).result;
		    })._thenRunCallbacks(options);
	    }
	});
}(this));

(function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;

    Parse.Installation = Parse.Object.extend("_Installation");

    /**
     * Contains functions to deal with Push in Parse
     * @name Parse.Push
     * @namespace
     */
    Parse.Push = Parse.Push || {};

    /**
     * Sends a push notification.
     * @param {Object} data -  The data of the push notification.  Valid fields
     * are:
     *   <ol>
     *     <li>channels - An Array of channels to push to.</li>
     *     <li>push_time - Ahen to expire
     *         the push.</li>
     *     <li>expiration_interval - The seconds from now to expire the push.</li>
     *     <li>where - A Parse.Query over Parse.Installation that is used to match
     *         a set of installations to push to.</li>
     *     <li>data - The data to send as part of the push</li>
     *   <ol>
     * @param {Object} options An object that has an optional success function,
     * that takes no arguments and will be called on a successful push, and
     * an error function that takes a Parse.Error and will be called if the push
     * failed.
     */
    Parse.Push.send = function(data, options) {
	if (data.where) {
	    data.where = data.where.toJSON().where;
	}

	if (data.push_time) {
	    data.push_time = data.push_time.toJSON();
	}

	if (data.expiration_time) {
	    data.expiration_time = data.expiration_time.toJSON();
	}

	if (data.expiratio
	    }

	var request = Parse._request('push', null, null, 'POST', data);
	return request._thenRunCallbacks(options);
    };
}(this));