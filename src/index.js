/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-09-12
* Updated at  : 2017-09-12
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

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

	process : function (tokens) {
		var i          = tokens.length,
			processors = this.processors,
			j, k, declarations;

		while (i--) {
			declarations = tokens[i].declarations;
			j = declarations.length;

			while (j--) {
				k = processors.length;

				if (processors[declarations[j].property]) {
					processors[declarations[j].property](declarations[j], j, declarations);
				}
			}

			this.process(tokens[i].related_rules);
		}
	},

	parse : function (code, is_beauty, tab_space) {
		var i = 0, rules = parser(code, tab_space), result = '';

		this.process(rules);

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
