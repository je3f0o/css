/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-09-12
* Updated at  : 2017-11-02
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// ignore:end

var parser = require("./parser");

var CssPreprocessor = function () {
	this.processors = Object.create(null);
};

CssPreprocessor.prototype = {
	register : function (hash, handler) {
		this.processors[hash] = handler;
		return this;
	},

	process : function (scope) {
		var rules      = scope.rules,
			i          = rules.length,
			processors = this.processors,
			j, k, frames, declarations;

		while (i--) {
			switch (rules[i].type) {
				case "Rule" :
					declarations = rules[i].declarations;
					j = declarations.length;

					while (j--) {
						if (processors[declarations[j].property]) {
							processors[declarations[j].property](declarations[j], j, declarations);
						}
					}
					this.process(rules[i].scope);
					break;
				case "Keyframe" :
					frames = rules[i].frames;
					j      = frames.length;

					while (j--) {
						declarations = frames[i].declarations;
						k = declarations.length;

						while (k--) {
							if (processors[declarations[k].property]) {
								processors[declarations[k].property](declarations[k], k, declarations);
							}
						}
					}
					break;
			}
		}
	},

	parse : function (code, scope, tab_space) {
		return parser(code, scope, tab_space);
	},

	compile : function (scope, is_beauty) {
		var i = 0, rules = scope.rules, result = '';

		for (; i < rules.length; ++i) {
			if (is_beauty) {
				result += rules[i].compile_beauty();
				if (i + 1 < rules.length) {
					result += '\n';
				}
			} else {
				result += rules[i].compile_ugly();
			}
		}

		return result;
	}
};

module.exports = CssPreprocessor;
