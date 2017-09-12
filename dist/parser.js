/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-09-10
* Updated at  : 2017-09-12
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Rule      = require("./rule"),
	Media     = require("./media"),
	tokenizer = require("./tokenizer");

module.exports = function css_parser (source_code, tab_space) {
	tokenizer.init(source_code, tab_space);

	var rules    = [],
		streamer = tokenizer.streamer,
		cursor   = streamer.get_cursor(),
		token    = tokenizer.next(), rule;

	while (token) {
		if (token.delimiter === '@') {
			rules.push(new Media(token, tokenizer));
		} else {
			rule = new Rule(token.start);

			streamer.cursor = cursor;

			rule.parse_selectors(tokenizer);
			rule.parse_body(tokenizer);
			rules.push(rule);
		}

		cursor = streamer.get_cursor();
		token  = tokenizer.next();
	}

	return rules;
};
