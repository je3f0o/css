/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : rule.js
* Created at  : 2017-09-10
* Updated at  : 2017-09-12
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Declaration = require("./declaration");

var MATH_MAX          = Math.max,
	AND_SIGN_REGEX    = /\&/g,
	SELECTOR_OPERATOR = /([\+\>])/g,

replace_operator = function (m, op) {
	return ' ' + op + ' ';
};

var except = function (tokenizer, type) {
	var token = tokenizer.next();
	if (token.type === type) {
		return token;
	}

	throw new Error("Unexpected token");
},

Rule = function (start) {
	this.type          = "Rule";
	this.selectors     = [];
	this.declarations  = [];
	this.related_rules = [];
	this.start         = start;
};

Rule.prototype = {
	add_selector : function (selector, other_selectors) {
		if (other_selectors) {
			for (var i = 0; i < other_selectors.length; ++i) {
				this.selectors.push(selector.replace(AND_SIGN_REGEX, other_selectors[i]));
			}
		} else {
			this.selectors.push(selector);
		}
	},

	parse_selectors : function (tokenizer, other_selectors) {
		var token = tokenizer.next(), selector = '', next, character;

		LOOP:
		while (token) {
			if (token.type === "Identifier") {
				if (selector) {
					character = selector.charAt(selector.length - 1);
					switch (character) {
						case '&' :
						case '>' :
						case '+' :
							break;
						default:
							selector += ' ';
					}
				}
				selector += token.name;
			} else {
				switch (token.delimiter) {
					case '&' :
						selector += '&';
						break;
					case ',' :
						if (! selector) {
							throw new Error("Unexpected token");
						}
						this.add_selector(selector, other_selectors);
						selector = '';
						break;
					case '>' :
						selector += '>';
						break;
					case '[' :
						console.log("Implement me", token);
						process.exit();
						break;
					case '{' :
						this.add_selector(selector, other_selectors);
						selector = '';
						break LOOP;
					default:
						throw new Error("Unexpected token");
				}
			}

			next = tokenizer.next();
			if (next.delimiter === ':') {
				if (next.start.index === token.end.index) {
					selector += ':';
				}

				token     = next;
				next      = except(tokenizer, "Identifier");
				selector += next.name;

				token = tokenizer.next();
			} else {
				token = next;
			}
		}
	},

	parse_body : function (tokenizer) {
		var streamer = tokenizer.streamer,
			cursor   = streamer.get_cursor(),
			token    = tokenizer.next(),
			next, rule, declaration;

		while (token) {
			if (token.delimiter === '}') {
				this.end = token.end;
				break;
			}

			next = tokenizer.next();

			if (token.type === "Identifier" && next.delimiter === ':') {
				declaration = new Declaration(token);
				declaration.parse_values(tokenizer);
				this.declarations.push(declaration); 

				if (tokenizer.streamer.peek(declaration.end.index - 1) === '}') {
					this.end = declaration.end;
					break;
				}
			} else {
				rule = new Rule(token.start);

				streamer.cursor = cursor;
				rule.parse_selectors(tokenizer, this.selectors);
				rule.parse_body(tokenizer);

				this.related_rules.push(rule);
			}

			cursor = streamer.get_cursor();
			token  = tokenizer.next();
		}
	},

	compile_beauty : function () {
		var i = 0, max = 0, rules = [], result = '';

		for (; i < this.declarations.length; ++i) {
			max = MATH_MAX(this.declarations[i].property.length, max);
		}
		this.declarations.sort(function (a, b) {
			return a.property.length - b.property.length;
		});

		for (i = 0; i < this.declarations.length; ++i) {
			rules.push(this.declarations[i].compile_beauty(max));
		}

		if (rules.length) {
			for (i = 0, max = 0; i < this.selectors.length; ++i) {
				this.selectors[i] = this.selectors[i].replace(SELECTOR_OPERATOR, replace_operator);
				max = MATH_MAX(this.selectors[i].length, max);
			}
			result = this.selectors.join(",\n") + " {\n\t" + rules.join(";\n\t") + "\n}";
		}

		if (this.related_rules.length) {
			if (result) {
				result += '\n';
			}

			for (i = 0; i < this.related_rules.length; ++i) {
				result += this.related_rules[i].compile_beauty();

				if (i + 1 < this.related_rules.length) {
					result += '\n';
				}
			}
		}

		return result;
	},

	compile_ugly : function () {
		var i = 0, rules = [], result = '';

		for (; i < this.declarations.length; ++i) {
			rules.push(this.declarations[i].compile_ugly());
		}

		if (rules.length) {
			result = this.selectors.join(',') + '{' + rules.join(';') + '}';
		}

		for (i = 0; i < this.related_rules.length; ++i) {
			result += this.related_rules[i].compile_ugly();
		}

		return result;
	},
};

module.exports = Rule;
