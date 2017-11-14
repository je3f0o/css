/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parse_arguments.js
* Created at  : 2017-09-12
* Updated at  : 2017-09-30
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

module.exports = function parse_arguments (tokenizer) {
	var	token = tokenizer.next(), value = '(';

	LOOP:
	while (token) {
		if (token.name) {
			value += token.name;
			token = tokenizer.next();

			while (token.name) {
				value += ' ' + token.name;
				token = tokenizer.next();
			}
		} else {
			throw new Error("Unexpected token");
		}

		switch (token.delimiter) {
			case '(' :
				value += parse_arguments(tokenizer);
				token = tokenizer.next();
				if (token.delimiter === ')') {
					value += ')';
					break LOOP;
				}
				break;
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
