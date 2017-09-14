/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-09-12
* Updated at  : 2017-09-13
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

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
			j, k, declarations;

		while (i--) {
			declarations = rules[i].declarations;
			j = declarations.length;

			while (j--) {
				k = processors.length;

				if (processors[declarations[j].property]) {
					processors[declarations[j].property](declarations[j], j, declarations);
				}
			}

			this.process(rules[i].scope);
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
