/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : keyframe.js
* Created at  : 2017-11-02
* Updated at  : 2017-11-03
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// ignore:end

var MATH_MAX    = Math.max,
	Declaration = require("./declaration");

var Frame = function (token, tokenizer) {
	var next, declaration;

	this.type         = "Frame";
	this.name         = token.name;
	this.declarations = [];
	this.start        = token.start;

	token = tokenizer.next();
	if (! token || token.delimiter !== '{') {
		throw new Error("Unexpected token");
	}

	token = tokenizer.next();
	while (token) {
		if (token.delimiter === '}') {
			this.end = token.end;
			break;
		}

		next = tokenizer.next();

		if (next && next.delimiter === ':') {
			declaration = new Declaration(token);
			declaration.parse_values(tokenizer);
			this.declarations.push(declaration); 
		} else {
			throw new Error("Unexpected token");
		}

		token = tokenizer.next();
	}
};

Frame.prototype = {
	compile_beauty : function (scope) {
		var i = 0, max = 0, rules = [], result = '';

		for (; i < this.declarations.length; ++i) {
			max = MATH_MAX(this.declarations[i].property.length, max);
		}
		this.declarations.sort((a, b) => {
			return a.property.length - b.property.length;
		});

		for (i = 0; i < this.declarations.length; ++i) {
			rules.push(this.declarations[i].compile_beauty(scope, max));
		}

		if (rules.length) {
			result = `${ this.name } {\n\t\t${ rules.join(";\n\t\t") };\n\t}`;
		}

		return result;
	},
	compile_ugly : function (scope) {
		var i = 0, rules = [], result = '';

		for (; i < this.declarations.length; ++i) {
			rules.push(this.declarations[i].compile_ugly(scope));
		}

		if (rules.length) {
			result = `${ this.name }{${ rules.join(';') }}`;
		}

		return result;
	}
};

var Keyframe = function (start, tokenizer, scope) {
	var token = tokenizer.next();

	this.type   = "Keyframe";
	this.name   = token.name;
	this.scope  = scope;
	this.frames = [];
	this.start  = start;

	token = tokenizer.next();
	if (! token || token.delimiter !== '{') {
		throw new Error("Unexpected token");
	}

	token = tokenizer.next();
	while (token) {
		if (token.delimiter === '}') {
			this.end = token.end;
			break;
		} else {
			this.frames.push(new Frame(token, tokenizer, scope));
			token = tokenizer.next();
		}
	}
};

Keyframe.prototype = {
	compile_beauty : function () {
		var i = 0, result = '';

		for (; i < this.frames.length; ++i) {
			if (result) {
				result += '\n\t';
			}
			result += this.frames[i].compile_beauty(this.scope);
		}

		return `@keyframes ${ this.name } {\n\t${ result }\n}`;
	},
	compile_ugly : function () {
		var i = 0, result = '';

		for (; i < this.frames.length; ++i) {
			result += this.frames[i].compile_ugly(this.scope);
		}

		return `@keyframes ${ this.name }{${ result }}`;
	}
};

module.exports = Keyframe;
