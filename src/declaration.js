/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : declaration.js
* Created at  : 2017-09-10
* Updated at  : 2017-09-12
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

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
			if (token.type === "Identifier") {
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
					default:
						throw new Error("Unexpected token");
				}
			}

			token = tokenizer.next();
		}
	},

	compile_ugly : function () {
		return `${ this.property }:${ this.values.join(',') }`;
	},

	compile_beauty : function (max) {
		var i = 0, len = max - this.property.length, space = '';

		for (; i < len; ++i) {
			space += ' ';
		}

		return `${ this.property }${ space } : ${ this.values.join(", ") }`;
	}
};

module.exports = Declaration;
