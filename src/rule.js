/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : rule.js
* Created at  : 2017-09-10
* Updated at  : 2017-09-13
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var MATH_MAX          = Math.max,
	AND_SIGN_REGEX    = /\&/g,
	SELECTOR_OPERATOR = /([\+\>])/g,

	Scope            = require("./scope"),
	Variable         = require("./variable"),
	Declaration      = require("./declaration"),
	replace_operator = function (m, op) {
		return ` ${ op } `;
	},

/*
	has_space = function (character) {
		switch (character) {
			case '&' :
			case '>' :
			case '+' :
			case '[' :
			case ']' :
			case '(' :
			case ')' :
				return false;
			default:
				if (character) {
					return true;
				}
		}
	},
	*/

Rule = function (start, parent_scope) {
	this.type         = "Rule";
	this.scope        = new Scope(parent_scope);
	this.selectors    = [];
	this.declarations = [];
	this.start        = start;
};

Rule.prototype = {
	add_selector : function (selector, other_selectors) {
		if (other_selectors) {
			var has_reference = selector.indexOf('&') !== -1;

			for (var i = 0; i < other_selectors.length; ++i) {
				if (has_reference) {
					this.selectors.push(selector.replace(AND_SIGN_REGEX, other_selectors[i]));
				} else {
					this.selectors.push(`${ other_selectors[i] } ${ selector }`);
				}
			}
		} else {
			this.selectors.push(selector);
		}
	},

	parse_selectors : function (tokenizer, other_selectors) {
		var token = tokenizer.next(), selector = '',
			next, character, except_paren, except_square;

		LOOP:
		while (token) {
			if (token.type === "Identifier") {
				if (selector) {
					character = selector.charAt(selector.length - 1);
					switch (character) {
						case '&' :
						case '>' :
						case '+' :
						case '[' :
						case ']' :
						case '(' :
						case ')' :
							break;
						default:
							if (selector) {
								selector += ' ';
							}
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
					case '*' :
						character = selector.charAt(selector.length - 1);
						switch (character) {
							case '>' :
							case '+' :
								break;
							default:
								if (selector) {
									selector += ' ';
								}
						}
						selector += '*';
						break;
					case '[' :
						selector += '[';
						except_square = true;
						break;
					case ']' :
						if (except_square) {
							selector += ']';
							except_square = false;
						} else {
							throw new Error("Unexpected token");
						}
						break;
					case '(' :
						selector += '(';
						except_paren = true;
						break;
					case ')' :
						if (except_paren) {
							selector += ')';
							except_paren = false;
						} else {
							throw new Error("Unexpected token");
						}
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

				token = next;
				next  = tokenizer.next();

				if (next.name) {
					selector += next.name;
				} else {
					throw new Error("Unexpected token");
				}

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
			_var, next, rule, declaration;

		while (token) {
			if (token.delimiter === '}') {
				this.end = token.end;
				break;
			}

			if (token.name && token.name.charAt(0) === '$') {
				_var = new Variable(token);
				_var.parse_value(tokenizer);

				this.scope.variables[_var.name] = _var;
			} else {
				next = tokenizer.next();

				if (token.name && next.delimiter === ':') {
					declaration = new Declaration(token);
					declaration.parse_values(tokenizer, this.scope);
					this.declarations.push(declaration); 

					if (tokenizer.streamer.peek(declaration.end.index - 1) === '}') {
						this.end = declaration.end;
						break;
					}
				} else {
					rule = new Rule(token.start, this.scope);

					streamer.cursor = cursor;
					rule.parse_selectors(tokenizer, this.selectors);
					rule.parse_body(tokenizer);

					this.scope.rules.push(rule);
				}
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
		this.declarations.sort((a, b) => {
			return a.property.length - b.property.length;
		});

		for (i = 0; i < this.declarations.length; ++i) {
			rules.push(this.declarations[i].compile_beauty(this.scope, max));
		}

		if (rules.length) {
			for (i = 0, max = 0; i < this.selectors.length; ++i) {
				this.selectors[i] = this.selectors[i].replace(SELECTOR_OPERATOR, replace_operator);
				max = MATH_MAX(this.selectors[i].length, max);
			}
			result = `${ this.selectors.join(",\n") } {\n\t${ rules.join(";\n\t") };\n}`;
		}

		if (this.scope.rules.length) {
			if (result) {
				result += '\n';
			}

			for (i = 0; i < this.scope.rules.length; ++i) {
				result += this.scope.rules[i].compile_beauty();

				if (i + 1 < this.scope.rules.length) {
					result += '\n';
				}
			}
		}

		return result;
	},

	compile_ugly : function () {
		var i = 0, rules = [], result = '';

		for (; i < this.declarations.length; ++i) {
			rules.push(this.declarations[i].compile_ugly(this.scope));
		}

		if (rules.length) {
			result = `${ this.selectors.join(',') }{${ rules.join(';') }}`;
		}

		for (i = 0; i < this.scope.rules.length; ++i) {
			result += this.scope.rules[i].compile_ugly(this.scope);
		}

		return result;
	},
};

module.exports = Rule;
