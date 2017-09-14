/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : variable.js
* Created at  : 2017-09-13
* Updated at  : 2017-09-13
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Variable = function (token) {
	this.type  = "Variable";
	this.name  = token.name.substring(1);
	this.value = null;
	this.start = token.start;
};

Variable.prototype = {
	parse_value : function (tokenizer) {
		var token = tokenizer.next();
		if (token.delimiter === '=') {
			var value = '';

			LOOP:
			while ((token = tokenizer.next())) {
				if (token.name) {
					if (value) {
						switch (value.charAt(value.length - 1)) {
							case ',' :
							case '(' :
								break;
							default:
								value += ' ';
						}
					}
					value += token.name;
				} else {
					switch (token.delimiter) {
						case ';' :
						case '}' :
							this.value = value;
							this.end   = token.end;
							break LOOP;
						case ',' :
						case '(' :
						case ')' :
							value += token.delimiter;
							break;
						default:
							throw new Error("Unexpected token");
					}
				}
			}
		} else {
			console.log(token);
			throw new Error("Unexpected token");
		}
	}
};

module.exports = Variable;
