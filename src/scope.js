/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : scope.js
* Created at  : 2017-09-13
* Updated at  : 2017-09-13
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var Scope = function (parent) {
	this.rules     = [];
	this.parent    = parent || null;
	this.variables = Object.create(null);
};

Scope.prototype = {
	find : function (name) {
		if (this.variables[name]) {
			return this.variables[name].value;
		} else if (this.parent) {
			return this.parent.find(name);
		}

		throw new Error(`Variable '$${ name }' is not defined.`);
	}
};

module.exports = Scope;
