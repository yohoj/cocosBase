'use strict';

(function (global, factory) {
	if(typeof exports === 'object' && typeof module !== 'undefined'){
		// module.exports = factory();
		if(!global){
			global = window;
		}
		global.querystring = factory();
	}
	else if(typeof define === 'function' && define.amd){
		define(factory)
	}
	else{
		global.querystring = factory();
	}

}(window, (function (exports) { 'use strict';

  var strictUriEncode = function strictUriEncode(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (x) {
      return '%' + x.charCodeAt(0).toString(16).toUpperCase();
    });
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var token = '%[a-f0-9]{2}';
  var singleMatcher = new RegExp(token, 'gi');
  var multiMatcher = new RegExp('(' + token + ')+', 'gi');

  function decodeComponents(components, split) {
  	try {
  		// Try to decode the entire string first
  		return decodeURIComponent(components.join(''));
  	} catch (err) {
  		// Do nothing
  	}

  	if (components.length === 1) {
  		return components;
  	}

  	split = split || 1;

  	// Split the array in 2 parts
  	var left = components.slice(0, split);
  	var right = components.slice(split);

  	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
  }

  function decode(input) {
  	try {
  		return decodeURIComponent(input);
  	} catch (err) {
  		var tokens = input.match(singleMatcher);

  		for (var i = 1; i < tokens.length; i++) {
  			input = decodeComponents(tokens, i).join('');

  			tokens = input.match(singleMatcher);
  		}

  		return input;
  	}
  }

  function customDecodeURIComponent(input) {
  	// Keep track of all the replacements and prefill the map with the `BOM`
  	var replaceMap = {
  		'%FE%FF': '\uFFFD\uFFFD',
  		'%FF%FE': '\uFFFD\uFFFD'
  	};

  	var match = multiMatcher.exec(input);
  	while (match) {
  		try {
  			// Decode as big chunks as possible
  			replaceMap[match[0]] = decodeURIComponent(match[0]);
  		} catch (err) {
  			var result = decode(match[0]);

  			if (result !== match[0]) {
  				replaceMap[match[0]] = result;
  			}
  		}

  		match = multiMatcher.exec(input);
  	}

  	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
  	replaceMap['%C2'] = '\uFFFD';

  	var entries = Object.keys(replaceMap);

  	for (var i = 0; i < entries.length; i++) {
  		// Replace all decoded components
  		var key = entries[i];
  		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
  	}

  	return input;
  }

  var decodeUriComponent = function decodeUriComponent(encodedURI) {
  	if (typeof encodedURI !== 'string') {
  		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + (typeof encodedURI === 'undefined' ? 'undefined' : _typeof(encodedURI)) + '`');
  	}

  	try {
  		encodedURI = encodedURI.replace(/\+/g, ' ');

  		// Try the built in decoder first
  		return decodeURIComponent(encodedURI);
  	} catch (err) {
  		// Fallback to a more advanced decoder
  		return customDecodeURIComponent(encodedURI);
  	}
  };

  function encoderForArrayFormat(options) {
  	switch (options.arrayFormat) {
  		case 'index':
  			return function (key, value, index) {
  				return value === null ? [encode(key, options), '[', index, ']'].join('') : [encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('');
  			};
  		case 'bracket':
  			return function (key, value) {
  				return value === null ? [encode(key, options), '[]'].join('') : [encode(key, options), '[]=', encode(value, options)].join('');
  			};
  		default:
  			return function (key, value) {
  				return value === null ? encode(key, options) : [encode(key, options), '=', encode(value, options)].join('');
  			};
  	}
  }

  function parserForArrayFormat(options) {
  	var result = void 0;

  	switch (options.arrayFormat) {
  		case 'index':
  			return function (key, value, accumulator) {
  				result = /\[(\d*)\]$/.exec(key);

  				key = key.replace(/\[\d*\]$/, '');

  				if (!result) {
  					accumulator[key] = value;
  					return;
  				}

  				if (accumulator[key] === undefined) {
  					accumulator[key] = {};
  				}

  				accumulator[key][result[1]] = value;
  			};
  		case 'bracket':
  			return function (key, value, accumulator) {
  				result = /(\[\])$/.exec(key);
  				key = key.replace(/\[\]$/, '');

  				if (!result) {
  					accumulator[key] = value;
  					return;
  				}

  				if (accumulator[key] === undefined) {
  					accumulator[key] = [value];
  					return;
  				}

  				accumulator[key] = [].concat(accumulator[key], value);
  			};
  		default:
  			return function (key, value, accumulator) {
  				if (accumulator[key] === undefined) {
  					accumulator[key] = value;
  					return;
  				}

  				accumulator[key] = [].concat(accumulator[key], value);
  			};
  	}
  }

  function encode(value, options) {
  	if (options.encode) {
  		return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
  	}

  	return value;
  }

  function decode$1(value, options) {
  	if (options.decode) {
  		return decodeUriComponent(value);
  	}

  	return value;
  }

  function keysSorter(input) {
  	if (Array.isArray(input)) {
  		return input.sort();
  	}

  	if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object') {
  		return keysSorter(Object.keys(input)).sort(function (a, b) {
  			return Number(a) - Number(b);
  		}).map(function (key) {
  			return input[key];
  		});
  	}

  	return input;
  }

  function extract(input) {
  	var queryStart = input.indexOf('?');
  	if (queryStart === -1) {
  		return '';
  	}
  	return input.slice(queryStart + 1);
  }

  function parse(input, options) {
  	options = Object.assign({ decode: true, arrayFormat: 'none' }, options);

  	var formatter = parserForArrayFormat(options);

  	// Create an object with no prototype
  	var ret = Object.create(null);

  	if (typeof input !== 'string') {
  		return ret;
  	}

  	input = input.trim().replace(/^[?#&]/, '');

  	if (!input) {
  		return ret;
  	}

  	var _iteratorNormalCompletion = true;
  	var _didIteratorError = false;
  	var _iteratorError = undefined;

  	try {
  		for (var _iterator = input.split('&')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
  			var param = _step.value;

  			var _param$replace$split = param.replace(/\+/g, ' ').split('='),
  			    _param$replace$split2 = slicedToArray(_param$replace$split, 2),
  			    key = _param$replace$split2[0],
  			    value = _param$replace$split2[1];

  			// Missing `=` should be `null`:
  			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters


  			value = value === undefined ? null : decode$1(value, options);

  			formatter(decode$1(key, options), value, ret);
  		}
  	} catch (err) {
  		_didIteratorError = true;
  		_iteratorError = err;
  	} finally {
  		try {
  			if (!_iteratorNormalCompletion && _iterator.return) {
  				_iterator.return();
  			}
  		} finally {
  			if (_didIteratorError) {
  				throw _iteratorError;
  			}
  		}
  	}

  	return Object.keys(ret).sort().reduce(function (result, key) {
  		var value = ret[key];
  		if (Boolean(value) && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && !Array.isArray(value)) {
  			// Sort object keys, not values
  			result[key] = keysSorter(value);
  		} else {
  			result[key] = value;
  		}

  		return result;
  	}, Object.create(null));
  }

  var extract_1 = extract;
  var parse_1 = parse;

  var stringify = function stringify(obj, options) {
  	var defaults$$1 = {
  		encode: true,
  		strict: true,
  		arrayFormat: 'none'
  	};

  	options = Object.assign(defaults$$1, options);

  	if (options.sort === false) {
  		options.sort = function () {};
  	}

  	var formatter = encoderForArrayFormat(options);

  	return obj ? Object.keys(obj).sort(options.sort).map(function (key) {
  		var value = obj[key];

  		if (value === undefined) {
  			return '';
  		}

  		if (value === null) {
  			return encode(key, options);
  		}

  		if (Array.isArray(value)) {
  			var result = [];

  			var _iteratorNormalCompletion2 = true;
  			var _didIteratorError2 = false;
  			var _iteratorError2 = undefined;

  			try {
  				for (var _iterator2 = value.slice()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
  					var value2 = _step2.value;

  					if (value2 === undefined) {
  						continue;
  					}

  					result.push(formatter(key, value2, result.length));
  				}
  			} catch (err) {
  				_didIteratorError2 = true;
  				_iteratorError2 = err;
  			} finally {
  				try {
  					if (!_iteratorNormalCompletion2 && _iterator2.return) {
  						_iterator2.return();
  					}
  				} finally {
  					if (_didIteratorError2) {
  						throw _iteratorError2;
  					}
  				}
  			}

  			return result.join('&');
  		}

  		return encode(key, options) + '=' + encode(value, options);
  	}).filter(function (x) {
  		return x.length > 0;
  	}).join('&') : '';
  };

  var parseUrl = function parseUrl(input, options) {
  	return {
  		url: input.split('?')[0] || '',
  		query: parse(extract(input), options)
  	};
  };

  var src = {
  	extract: extract_1,
  	parse: parse_1,
  	stringify: stringify,
  	parseUrl: parseUrl
  };

  // exports.default = src;
  // exports.extract = extract_1;
  // exports.parse = parse_1;
  // exports.stringify = stringify;
  // exports.parseUrl = parseUrl;

  // Object.defineProperty(exports, '__esModule', { value: true });
	return src;
})));
