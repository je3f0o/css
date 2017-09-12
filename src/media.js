/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : media.js
* Created at  : 2017-09-10
* Updated at  : 2017-09-10
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var Rule = require("./rule");

module.exports = function Media (token, tokenizer) {
	var next = tokenizer.next();
	if (next.start.index !== token.end.index || next.name !== "media") {
		throw new Error("Unexpected token");
	}

	this.type  = "Media";
	this.media = [];
	this.rules = [];
	this.start = token.start;

	token = tokenizer.next();
	while (token) {
		if (token.delimiter === '{') {
			token = tokenizer.next();
			break;
		}

		this.media.push(token);
		token = tokenizer.next();
	}

	while (token) {
		if (token.delimiter === '}') {
			this.end = token.end;
			break;
		}

		this.rules.push(new Rule(token, tokenizer));
		token = tokenizer.next();
	}
};
