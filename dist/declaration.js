/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : declaration.js
* Created at  : 2017-09-10
* Updated at  : 2017-09-13
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var parse_arguments = function (tokenizer) {
	var	token = tokenizer.next(), value = '(';

	LOOP:
	while (token) {
		if (token.name) {
			value += token.name;
		} else {
			throw new Error("Unexpected token");
		}

		token = tokenizer.next();
		switch (token.delimiter) {
			case ',' :
				value += ',';
				token = tokenizer.next();
				break;
			case ')' :
				value += ')';
				break LOOP;
			default:
				throw new Error("Unexpected token");
		}
	}

	return value;
};

var Declaration = function (token) {
	this.type     = "Declaration";
	this.property = token.name;
	this.values   = [];
	this.start    = token.start;
};

Declaration.prototype = {
	parse_values : function (tokenizer) {
		var	token = tokenizer.next(), value = '';

		LOOP :
		while (token) {
			if (token.name) {
				if (value) {
					value += ' ';
				}
				value += token.name;
			} else {
				switch (token.delimiter) {
					case ';' :
						this.values.push(value);
						this.end = token.end;
						break LOOP;
					case '}' :
						this.values.push(value);
						this.end = this.values[this.values.length - 1].end;
						break LOOP;
					case ',' :
						this.values.push(value);
						value = '';
						break;
					case '(' :
						value += parse_arguments(tokenizer);
						break;
					default:
						throw new Error("Unexpected token");
				}
			}

			token = tokenizer.next();
		}
	},

	compile_ugly : function (scope) {
		var i = 0, values = [];

		for (; i < this.values.length; ++i) {
			if (this.values[i].charAt(0) === '$') {
				values.push(scope.find(this.values[i].substring(1)));
			} else {
				values.push(this.values[i]);
			}
		}

		return this.property + ':' + values.join(',');
	},

	compile_beauty : function (scope, max) {
		var i = 0, len = max - this.property.length, space = '', values = [], value;

		for (; i < len; ++i) {
			space += ' ';
		}

		i = this.values.length;
		while (i--) {
			if (this.values[i].charAt(0) === '$') {
				values[i] = scope.find(this.values[i].substring(1));
			} else {
				values[i] = this.values[i];
			}
		}

		if (values.length > 1) {
			value = "\n\t\t" + values.join(",\n\t\t");
		} else {
			value = values[0];
		}

		return this.property + space + " : " + value;
	}
};

module.exports = Declaration;
