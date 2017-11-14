/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : tokenizer.js
* Created at  : 2017-09-10
* Updated at  : 2017-11-03
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var assign    = require("jeefo_utils/object/assign"),
	Tokenizer = require("jeefo_tokenizer"),
	tokenizer = new Tokenizer(),

	DELIMITERS = [
		';', ':',
		'[', ']',
		'(', ')',
		'{', '}',
		',', '~',
		'+', '>',
		'&', '*',
		'=', '@',
	].join('');

tokenizer.
register({
	protos : {
		type       : "Identifier",
		initialize : function (character, streamer) {
			var start = streamer.get_cursor(), end = {};

			while (character && character > ' ' && DELIMITERS.indexOf(character) === -1) {
				assign(end, streamer.cursor);
				character = streamer.next();
			}

			this.type  = this.type;
			this.name  = streamer.seek(start.index);
			this.start = start;
			this.end   = streamer.get_cursor();

			streamer.cursor = end;
		}
	}
}).
register({
	is : function (character) {
		switch (character) {
			case ';' :
			case ':' :
			case '[' :
			case ']' :
			case '(' :
			case ')' :
			case '{' :
			case '}' :
			case ',' :
			case '~' :
			case '+' :
			case '>' :
			case '&' :
			case '*' :
			case '=' :
			case '@' :
				return true;
		}
	},
	protos : {
		type       : "Delimiter",
		precedence : 10,
		initialize : function (character, streamer) {
			this.type      = this.type;
			this.delimiter = character;
			this.start     = streamer.get_cursor();
			this.end       = streamer.end_cursor();
		}
	}
});

module.exports = tokenizer;
