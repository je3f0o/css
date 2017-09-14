/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-09-10
* Updated at  : 2017-09-13
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Rule      = require("./rule"),
	Scope     = require("./scope"),
	Media     = require("./media"),
	Variable  = require("./variable"),
	tokenizer = require("./tokenizer");

module.exports = function css_parser (source_code, scope, tab_space) {
	tokenizer.init(source_code, tab_space);
	if (! scope) {
		scope = new Scope();
	}

	var streamer = tokenizer.streamer,
		cursor   = streamer.get_cursor(),
		token    = tokenizer.next(), rule, _var;

	while (token) {
		if (token.delimiter === '@') {
			scope.rules.push(new Media(token, tokenizer));
		} else if (token.name.charAt(0) === '$') {
			_var = new Variable(token);
			_var.parse_value(tokenizer);

			scope.variables[_var.name] = _var;
		} else {
			rule = new Rule(token.start, scope);

			streamer.cursor = cursor;

			rule.parse_selectors(tokenizer);
			rule.parse_body(tokenizer);
			scope.rules.push(rule);
		}

		cursor = streamer.get_cursor();
		token  = tokenizer.next();
	}

	return scope;
};
