/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : test.js
* Created at  : 2017-09-10
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

var Declaration     = require("../src/declaration"),
	CssPreprocessor = require("../src/index"),
	pp = new CssPreprocessor(),
	WHITE_SPACE_REGEX = /\s+/;

var code = `

$primary-color    = blue;
$primary-contrast = white;

@keyframes md-ripple-remove {
	0% {
		color   : $primary-color;
		opacity : .15;
	}
	to {
		opacity : 0;
	}
}

test {
	> * + * {
		hello : world;
	}
}

.md-scrollable-content {
	bgc   : $primary-color;
	minW  : 100%;
	color : $primary-contrast;
}
.md-scrollable-track {
	$zIndex = 123;

	z          : $zIndex;
	abs        : right 0;
	bgc        : transparent;
	opacity    : 0;
	transition : background-color .2s linear, opacity .2s linear;
}

.md-scrollable-track-y {
	w   : 15px;
	pos : top 222, bottom 0;

	> .md-scrollable-scrollbar {
		w     : 6px;
		right : 2px;
	}

	&:hover     > .md-scrollable-scrollbar,
	&.md-active > .md-scrollable-scrollbar {
		w   : 11px;
		bgc : #999;
	}
}

.md-scrollable-track-x {
	h   : 15px;
	pos : left 0, bottom 0;

	> .md-scrollable-scrollbar {
		h      : 6px;
		bottom : 2px;
	}

	&:hover     > .md-scrollable-scrollbar,
	&.md-active > .md-scrollable-scrollbar {
		h   : 11px;
		bgc : #999;
	}
}

.md-scrollable-scrollbar {
	br         : 6px;
	bgc        : #aaa;
	position   : absolute;
	transition :
		width  .2s linear,
		height .2s linear,
		border-radius .2s ease-in-out,
		background-color .2s linear;
}

.md-scrollable-container {
	size     : 100%;
	overflow : hidden;
	position : relative;

	&:hover > .md-scrollable-track {
		opacity : .6;
	}

	> .md-scrollable-track:hover,
	> .md-scrollable-track.md-active {
		bgc     : #eee;
		opacity : .9;
	}
}

.md-card {
	margin     : 8px;
	box-sizing : border-box;

	boxOrient : vertical;
	boxShadow :
		0 1px 3px 0 rgba(0,0,0,.2),
		0 1px 1px 0 rgba(0,0,0,.14),
		0 2px 1px -1px rgba(0,0,0,.12);
	flexDirection : column;

	card-inside {
		zzz : fff;
	}
}

.md-button.md-raised:not( [ disabled ] ) {
	boxShadow : 0 2px 5px 0 rgba(0,0,0,.26);
}
`;

var border_handler = () => {};

pp.
register("br", function (declaration) {
	declaration.property = "border-radius";
	border_handler(declaration);
}).
register("bgc", function (declaration) {
	declaration.property = "background-color";
}).
register("bgc", function (declaration) {
	declaration.property = "background-color";
}).
register("w", function (declaration) {
	declaration.property = "width";
}).
register("h", function (declaration) {
	declaration.property = "height";
}).
register("z", function (declaration) {
	declaration.property = "z-index";
}).
register("minW", function (declaration) {
	declaration.property = "min-width";
}).
register("minH", function (declaration) {
	declaration.property = "min-height";
}).
register("pos", function (current_declaration, index, declarations) {
	var values = current_declaration.values, i = values.length, v;

	while (i--) {
		v         = values[i].split(WHITE_SPACE_REGEX);
		values[i] = new Declaration({ name : v[0] });
		values[i].values.push(v[1]);
	}

	declarations.splice.apply(declarations, [index, 1].concat(values));
}).
register("border-radius", border_handler);

var rules = pp.parse(code);

console.log(pp.compile(rules, true));
