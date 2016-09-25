




/*
     FILE ARCHIVED ON 20:48:48 Jul 12, 2006 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 13:53:29 Sep 25, 2016.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
Array.prototype.shallowCopy = function () {
	var dest = new Array();
	for (var i = 0; i < this.length; ++i) {
		dest.push(this[i]);
	}
	return dest;
};

var STACK_CHANGE_ACTION = 1;
var MODE_CHANGE_ACTION = 2;
var REGISTER_CHANGE_ACTION = 3;

function StackChangeAction (popArray, pushArray) {
	this.type = STACK_CHANGE_ACTION;
	this.popArray = popArray;
	this.pushArray = pushArray;
}

function ModeChangeAction (modeChanges) {
	this.type = MODE_CHANGE_ACTION;
	this.modeChanges = modeChanges;
}

function RegisterChangeAction (cell, oldValue, newValue) {
	this.type = REGISTER_CHANGE_ACTION;
	this.cell = cell;
	this.oldValue = oldValue;
	this.newValue = newValue;
}

function ActionHistory () {
	this.pastActions = new Array();
	this.futureActions = new Array();
}

ActionHistory.prototype.push = function (action) {
	/* Does not actually perform an action.  Adds it to the history. */
	this.futureActions.splice(0, this.futureActions.length);
	this.pastActions.push(action);
};

ActionHistory.prototype.undo = function () {
	/* Does not actually perform an action.  Returns one to be performed. */
	if (this.pastActions.length) {
		var action = this.pastActions.pop();
		this.futureActions.unshift(action);
		return action;
	} else {
		return null;
	}
};

ActionHistory.prototype.redo = function () {
	/* Does not actually perform an action.  Returns one to be performed. */
	if (this.futureActions.length) {
		var action = this.futureActions.shift();
		this.pastActions.push(action);
		return action;
	} else {
		return null;
	}
};

/*	The CalculatorError exception class is a convenient way
	to stop program execution that allows us to perform certain
	actions like window.alert() when this type of exception is
	thrown.
*/
function CalculatorError (m) {
	this.message = m;
}
CalculatorError.prototype = new Error("");
CalculatorError.prototype.constructor = CalculatorError;

function Calculator () {
	this.stack = null;
	this.numberFormat = null;
	this.numberPrecision = null;
	this.textAlign = null;
	this.entryField = null;
	this.stackField = null;
	this.statusField = null;
	this.stackTopField = null;
	this.entryMode = null;
	this.historyField = null;
	this.historyText = "";
	this.historyIndent = "  ";
	this.moneyMode = null;

	this.registers = new Object();
	this.registerStoreKey = "=";
	this.registerRecallKey = "\`";
	this.actionHistory = new ActionHistory();
}

Calculator.prototype.rawPerform = function (action) {
	if (action.type == STACK_CHANGE_ACTION) {
		if (action.popArray.length) {
			this.stack.splice(this.stack.length - action.popArray.length,
				action.popArray.length);
		}
		if (action.pushArray.length) {
			for (var i = 0; i < action.pushArray.length; ++i)
				this.stack.push(action.pushArray[i]);
		}
	}
	if (action.type == MODE_CHANGE_ACTION) {
		for (i in action.modeChanges) {
			this[i] = action.modeChanges[i][1];
		}
	}
	if (action.type == REGISTER_CHANGE_ACTION) {
		if (action.newValue == null)
			delete this.registers[action.cell];
		else
			this.registers[action.cell] = action.newValue;
	}
};

Calculator.prototype.rawUnperform = function (action) {
	if (action.type == STACK_CHANGE_ACTION) {
		if (action.pushArray.length) {
			this.stack.splice(this.stack.length - action.pushArray.length,
				action.pushArray.length);
		}
		if (action.popArray.length) {
			for (var i = 0; i < action.popArray.length; ++i)
				this.stack.push(action.popArray[i]);
		}
	}
	if (action.type == MODE_CHANGE_ACTION) {
		for (i in action.modeChanges) {
			this[i] = action.modeChanges[i][0];
		}
	}
	if (action.type == REGISTER_CHANGE_ACTION) {
		if (action.oldValue == null)
			delete this.registers[action.cell];
		else
			this.registers[action.cell] = action.oldValue;
	}
};

Calculator.prototype.perform = function (action) {
	this.rawPerform(action);
	this.actionHistory.push(action);
	return action;
};

Calculator.prototype.undo = function () {
	var action = this.actionHistory.undo();
	if (action) {
		this.rawUnperform(action);
		if (action.appendHistory != null && this.historyField != null) {
			this.historyText = this.historyText.substring(0, this.historyText.length - action.appendHistory.length);

			this.historyField.value = this.historyText;
			this.historyField.scrollTop = this.historyField.scrollHeight;
		}
	}
};

Calculator.prototype.redo = function () {
	var action = this.actionHistory.redo();
	if (action) {
		this.rawPerform(action);
		if (action.appendHistory != null && this.historyField != null) {
			this.historyText += action.appendHistory;

			this.historyField.value = this.historyText;
			this.historyField.scrollTop = this.historyField.scrollHeight;
		}
	}
};

Calculator.prototype.setEntryField = function (v) {
	this.entryField.setAttribute("autocomplete", "off");
	/*	work around a Firefox bug that causes 'Permission denied to
		get property XULElement.selectedIndex' exceptions to happen
		when this.entryField.value is assigned to.  This bug exists
		because of a conflict with Firefox's autofill functionality.
	*/
	this.entryField.value = v;
};

/* TODO: Error: uncaught exception: [Exception... "Component returned
   failure code: 0x8000ffff (NS_ERROR_UNEXPECTED)
   [nsIDOMTreeWalker.nextNode]" nsresult: "0x8000ffff
   (NS_ERROR_UNEXPECTED)" location: "JS frame ::
   chrome://global/content/bindings/button.xml :: fireAccessKeyButton
   :: line 93" data: no] */

/*	Single-character names here are used for keybindings.
	All names are used for 'moo' and &moo& syntax.
	Supports functions that take any number of arguments.
	Supports functions that return arrays.
*/

Calculator.prototype.functions = {
	"sin":	{	func: Math.sin
			},
	"s":	{	func: Math.sin,
				historyName: "sin"
			},
	"cos":	{	func: Math.cos
			},
	"c":	{	func: Math.cos,
				historyName: "cos"
			},
	"atan":	{	func: Math.atan
			},
	"a":	{	func: Math.atan,
				historyName: "atan"
			},
	"tan":	{	func: Math.tan
			},
	"t":	{	func: Math.tan,
				historyName: "tan"
			},
	"ln":	{	func: Math.log
			},
	"l":	{	func: Math.log,
				historyName: "ln"
			},
	"exp":	{	func: Math.exp
			},
	"p":	{	func: Math.exp,
				historyName: "exp"
			},
	"sqrt":	{	func: Math.sqrt
			},
	"v":	{	func: Math.sqrt,
				historyName: "sqrt"
			},
	"+":	function (a, b) { return a + b; },
	"-":	function (a, b) { return a - b; },
	"*":	function (a, b) { return a * b; },
	"/":	function (a, b) { return a / b; },
	"^":	Math.pow,
	"%":	function (a, b) { return a % b; },
	"pi":	Math.PI,
	"ee":	Math.E,
	"X":	{	func: function (a, b) { return [b, a]; },
				historyName: "exch"
			},
	"d":	{	func: function (a) { return [a, a]; },
				historyName: "dup",
				duplicatesFirstArgument: true
			},
	"r":	{	func: function (x) { return 1 / x; },
				historyName: "recip"
			},
	"x":	{	func: function (x) { return []; },
				historyName: "pop"
			},
	/*-----------------------------------------------------------------------*/
	"dummy":[]
};

Calculator.prototype.clear = function () {
	this.stack = new Array();
	this.setEntryMode("numeric");
	this.setEntryField("");
};

Calculator.prototype.clearUI = function () {
	if (this.stack.length) {
		var action = this.perform(new StackChangeAction(
			this.stack.shallowCopy(), []
		));
		action.appendHistory = this.appendToHistory();
	}
	this.setEntryField("");
};

Calculator.prototype.initDefaults = function () {
	this.numberFormat = "N";
	this.numberPrecision = 5; /* not used with N */
	this.textAlign = "left";
	this.stackField.readOnly = 1;
	this.stackTopField.readOnly = 1;
	this.statusField.readOnly = 1;
	this.moneyMode = false;
	this.setEntryMode("numeric");
	this.setEntryField("");
};

Calculator.prototype.setDefaults = function () {
	this.perform(new ModeChangeAction({
		numberFormat:    [this.numberFormat, "N"],
		numberPrecision: [this.numberPrecision, 5],
		textAlign:       [this.textAlign, "left"],
		moneyMode:       [this.moneyMode, false]
	}));
	this.setEntryField("");
};

Calculator.prototype.setEntryMode = function (x) {
	this.entryMode = x;
	this.setKeyPressEvent();
	this.entryField.className = this.entryFieldClassName + " " + x + "-mode";
};

Calculator.prototype.setKeyPressEvent = function () {
	var x = this.entryMode;
	if (x in Calculator.prototype.keyPressEventFunctions) {
		this.onKeyPress = (Calculator.prototype.keyPressEventFunctions)[x];
	}
};

Calculator.prototype.initHistory = function () {
	// called after stack is initialized.
	// stack arrays start at the bottom, and end at the top.
	if (this.historyField) {
		this.historyText = "";
		this.appendToHistory(null, this.stack.length);
	}	
};

Calculator.prototype.appendToHistory = function (str, size) {
	if (this.historyField == null) return null;
	if (size == null) size = 1;

	var append = "";
	var that = this;
	var doAppend = function (s) {
		if (that.historyText == null) {
			that.historyText = s;
		} else {
			that.historyText += s;
		}
		if (append == null) {
			append = s;
		} else {
			append += s;
		}
	};

	if (str != null) {
		if (this.historyText != null && this.historyText.length) {
			doAppend(" ");
		}
		doAppend(str);
	}

	if (size) {
		if (this.stack.length) {
			for (var i = this.stack.length - size; i < this.stack.length; ++i) {
				if (i < 0) continue;
				if (this.historyText != null && this.historyText.length) {
					// don't append to empty textarea
					doAppend("\n");
				}
				for (var j = 0; j < i; ++j) {
					doAppend(this.historyIndent);
				}
				doAppend(this.stack[i]);
			}
		} else {
			if (this.historyText != null && this.historyText.length) {
				// don't append to empty textarea
				doAppend("\n(empty)");
			}
		}
	}

	this.historyField.value = this.historyText;
	this.historyField.scrollTop = this.historyField.scrollHeight;
	return append;
};

Calculator.prototype.init = function () {
	/*	The caller should invoke this method *after* all the
		*Field properties are set.
	*/
	this.stack = new Array();
	this.setEntryMode("numeric");
	this.setEntryField("");
	this.initDefaults();
	this.loadCookies();
	this.refresh();
	this.initHistory();
	this.stackField.style.overflow = "hidden"; // msie
	this.stackField.style.wrap = "off"; // msie
	var that = this; // for the closure
	this.entryField.onkeypress = function (e) {
		if (that.onKeyPress) {
			var r;
			try {
				// some browsers pass the event as a param
				// to the handler; others set window.event.
				if (!e) e = window.event;
				var key = (typeof e.which == 'number') ? e.which : e.keyCode;
				r = that.onKeyPress(key, e);
			}
			catch (ex) {
				if (ex instanceof CalculatorError) {
					window.alert(ex.message);
					r = false;
				} else {
					throw ex;
				}
			}
			return r;
		} else {
			return true; // browser handles
		}
	};
	this.entryFieldClassName = this.entryField.className;
};

Calculator.prototype.refreshStatus = function () {
	var value;
	switch (this.numberFormat) {
	case "S":
	case "E":	value = "SCI " + this.numberPrecision; break;
	case "F":	value = "FIXED " + this.numberPrecision; break;
	case "P":	value = "PREC " + this.numberPrecision; break;
	default:	value = "NORMAL"; break;
	}
	value = value + " " + this.textAlign.toUpperCase();
	if (this.moneyMode)
		value = value + " (MONEY)";
	value = value + " " + this.entryMode.toUpperCase();
	this.statusField.value = value;
};

Calculator.prototype.refreshStack = function () {
	var format = new Array();
	var formattop;
	this.stackField.style.textAlign = this.textAlign;
	this.stackTopField.style.textAlign = this.textAlign;
	for (var i = this.stack.length - 1; i >= 0; --i) {
		var value = this.stack[i];
		switch (this.numberFormat) {
		case "E":
		case "S":	format.push(value.toExponential(this.numberPrecision)); break;
		case "F":	format.push(value.toFixed(this.numberPrecision)); break;
		case "P":	format.push(value.toPrecision(this.numberPrecision)); break;
		default:	format.push(value.toString()); break;
		}
	}
	formattop = format.shift();
	if (formattop == null) formattop = "";
	this.stackTopField.value = formattop;
	var rows = format.length;
	if (rows < 4) rows = 4;
	this.stackField.rows = rows;
	this.stackField.value = format.join("\n");
};

Calculator.prototype.functionModeKeyPressEvent = function (key, e) {
	if (key == 0) {
		return true; // browser handles
	}
	var ch = String.fromCharCode(key);

	switch (ch) {
	case "&":
	case "\'":
	case "\r":
	case "\n":
		name = this.entryField.value;
		this.setEntryField("");
		this.setEntryMode("numeric");
		if (name == "") {
			/* do nothing */
		} else if (name in this.functions) {
			this.runFunction(name);
		} else {
			throw new CalculatorError("No such function: '" + name + "'");
		}
		this.refresh();
		return false;
	default:
		return true; // browser handles
	}
};

Calculator.prototype.registerStoreModeKeyPressEvent = function (key, e) {
	if (key == 0) {
		return true; // browser handles
	}
	if (key == 8) { // backspace
		this.setEntryField("");
		this.setEntryMode("numeric");
		this.refresh();
		return false; // browser ignores
	}
	if (key < 32 || key > 126) { // non-ASCII
		return false; // browser ignores
	}
	var ch = String.fromCharCode(key);

	if (this.stack.length < 1) {
		this.setEntryField("");
		this.setEntryMode("numeric");
		this.refresh();
		throw new CalculatorError("nothing to store");
	}

	var action = this.perform(new RegisterChangeAction(
		ch,
		this.registers[ch],
		this.stack[this.stack.length - 1]
	));
	action.appendHistory = this.appendToHistory("store " + ch);

	this.setEntryField("");
	this.setEntryMode("numeric");
	this.refresh();
	return false; // browser ignores
};

Calculator.prototype.registerRecallModeKeyPressEvent = function (key, e) {
	if (key == 0) {
		return true; // browser handles
	}
	if (key == 8) { // backspace
		this.setEntryField("");
		this.setEntryMode("numeric");
		this.refresh();
		return false; // browser ignores
	}
	if (key < 32 || key > 126) { // non-ASCII
		return false; // browser ignores
	}
	var ch = String.fromCharCode(key);

	if (!(ch in this.registers)) {
		this.setEntryField("");
		this.setEntryMode("numeric");
		this.refresh();
		throw new CalculatorError("nothing to recall");
	}

	var action = this.perform(new StackChangeAction(
		[],
		[this.registers[ch]]
	));
	action.appendHistory = this.appendToHistory("recall " + ch);

	this.setEntryField("");
	this.setEntryMode("numeric");
	this.refresh();
	return false; // browser ignores
};

Calculator.prototype.parseNumber = function (str) {
	var enteredCents = false;
	str = str.replace(/[\~\_]/, "-");
	if (/^\-?\d+$/.test(str) && this.moneyMode) {
		enteredCents = true;
	}
	var result = parseFloat(str);
	if (isNaN(result)) {
		throw new CalculatorError("'" + str + "' is not a number.");
	}
	if (enteredCents) {
		result /= 100;
	}
	return result;
};

Calculator.prototype.parseInteger = function (str) {
	str = str.replace(/[\~\_]/, "-");
	var result = parseInt(str);
	if (isNaN(result)) {
		throw new CalculatorError("'" + str + "' is not an integer.");
	}
	return result;
};

Calculator.prototype.numericModeKeyPressEvent = function (key, e) {
	if (key == 0) {
		return true; // browser handles
	}
	var ch = String.fromCharCode(key);

	if (ch in this.functions) {
		this.runFunction(ch);
		return false; // browser ignores
	}
	switch (ch) {
	case "\r":
	case "\n":
		if (this.entryField.value != "") {

			var value = this.parseNumber(this.entryField.value);
			var action = this.perform(new StackChangeAction([], [value]));
			action.appendHistory = this.appendToHistory();

			this.setEntryField("");
			this.refresh();
		} else {
			throw new CalculatorError("No value entered.");
		}
		return false;

	case this.registerStoreKey:
		if (this.entryField.value != "") {

			var value = this.parseNumber(this.entryField.value);
			var action = this.perform(new StackChangeAction([], [value]));
			action.appendHistory = this.appendToHistory();

			this.setEntryField("STORE:");
			this.setEntryMode("store");
			this.refresh();
		} else {
			this.setEntryField("STORE:");
			this.setEntryMode("store");
			this.refresh();
		}
		return false;

	case this.registerRecallKey:
		if (this.entryField.value != "") {

			var value = this.parseNumber(this.entryField.value);
			var action = this.perform(new StackChangeAction([], [value]));
			action.appendHistory = this.appendToHistory();

			this.setEntryField("RECALL:");
			this.setEntryMode("recall");
			this.refresh();
		} else {
			this.setEntryField("RECALL:");
			this.setEntryMode("recall");
			this.refresh();
		}
		return false;
		
	case "\'":
	case "&":
		if (this.entryField.value != "") {

			var value = this.parseNumber(this.entryField.value);
			var action = this.perform(new StackChangeAction([], [value]));
			action.appendHistory = this.appendToHistory();

			this.setEntryField("");
			this.setEntryMode("function");
			this.refresh();
		} else {
			this.setEntryMode("function");
			this.refresh();
		}
		return false;

	case "~":
		if (this.entryField.value != "") {
			if (this.entryField.value.charAt(0) == "-"
				|| this.entryField.value.charAt(0) == "_") {
				this.setEntryField(this.entryField.value.substring(1));
			} else {
				this.setEntryField("-" + this.entryField.value);
			}
		} else {
			this.entryField.value = "-";
		}
		return false;
	case "$":
		this.setMoneyMode();
		return false;
	case "S":
	case "E":
	case "F":
	case "P":
		this.setNumberFormat(ch);
		return false;
	case "L":
		this.perform(new ModeChangeAction({
			textAlign: [this.textAlign, "left"]
		}));
		this.refresh();
		return false;
	case "R":
		this.perform(new ModeChangeAction({
			textAlign: [this.textAlign, "right"]
		}));
		this.refresh();
		return false;
	case "N":
		this.setNormalNumberFormat();
		return false;
	case "C":
		this.clearUI();
		this.refresh();
		return false;	// browser ignores
	case "D":
		this.setDefaults();
		this.refresh();
		return false;	// browser ignores
	case "Z":
		this.undo();
		this.refresh();
		return false; // browser ignores
	case "Y":
		this.redo();
		this.refresh();
		return false; // browser ignores
	case "_":
	case "0":
	case "1":
	case "2":
	case "3":
	case "4":
	case "5":
	case "6":
	case "7":
	case "8":
	case "9":
	case "p":
	case ".":
	case "":
		return true; // browser handles
	default:
		// I'm torn on whether the browser should handle unanticipated
		// keypresses or not.
		return true;
	}
};

Calculator.prototype.setNormalNumberFormat = function (ch) {	
	this.perform(new ModeChangeAction({
		numberFormat: [this.numberFormat, "N"],
		numberPrecision: [this.numberPrecision, 5],
		moneyMode: [this.moneyMode, false]
	}));
	this.refresh();
};

Calculator.prototype.setNumberFormat = function (ch) {
	var changes = new Object();
	
	if (this.entryField.value != "") {
		var value = this.parseInteger(this.entryField.value);
		if (value < 0) {
			throw new CalculatorError("Can't use a negative integer.");
		}
		changes.numberPrecision = [this.numberPrecision, value];
	}

	changes.numberFormat = [this.numberFormat, ch];
	changes.moneyMode = [this.moneyMode, false];
	this.perform(new ModeChangeAction(changes));

	this.setEntryField("");
	this.refresh();
};

Calculator.prototype.setMoneyMode = function () {
	this.perform(new ModeChangeAction({
		numberPrecision: [this.numberPrecision, 2],
		numberFormat: [this.numberFormat, "F"],
		moneyMode: [this.moneyMode, true]
	}));
	this.setEntryField("");
	this.refresh();
};

Calculator.prototype.runFunction = function (functionName) {
	if (!(functionName in this.functions)) {
		throw new CalculatorError("Unexpected operation '" + functionName + "'.");
	}

	var theFunction = this.functions[functionName];
	var theObject;
	var historyName = functionName;
	var duplicatesFirstArgument = false;

	if (typeof(theFunction) == "object") {
		theObject = theFunction;
		if ("func" in theObject)
			theFunction = theObject["func"];
		else
			throw new Error("in Calculator.prototype.functions, " + functionName + "'s value has no func property.");
		if ("duplicatesFirstArgument" in theObject)
			duplicatesFirstArgument = theObject["duplicatesFirstArgument"];
		if ("historyName" in theObject)
			historyName = theObject["historyName"];
	}
	
	var isaFunction = typeof(theFunction) == "function";
	var theLength = isaFunction ? theFunction.length : 0;

	if (this.entryField.value == "") {
		if (this.stack.length < theLength) {
			throw new CalculatorError("Not enough values for operation."
				+ "  '" + functionName + "' requires "
				+ theLength + " arguments.");
		}
	} else {
		if (this.stack.length < (theLength - 1)) {
			throw new CalculatorError("Not enough values for operation."
				+ "  '" + functionName + "' requires "
				+ theLength + " arguments.");
		}
		var b = this.parseNumber(this.entryField.value);
		this.setEntryField("");

		var action = this.perform(new StackChangeAction([], [b]));
		action.appendHistory = this.appendToHistory();
	}

	var args = this.stack.slice(this.stack.length - theLength);
	var result = isaFunction ? theFunction.apply(this, args) : theFunction;

	if (typeof(result) == "object" && result.constructor == Array) {
		var action = this.perform(new StackChangeAction(args, result));
		
		if (result.length < args.length) {
			action.appendHistory =
				this.appendToHistory(historyName, 1);
		} else {
			action.appendHistory =
				this.appendToHistory(theLength ? historyName : null,
					result.length - (duplicatesFirstArgument ? 1 : 0));
		}
	} else {
		var action = this.perform(new StackChangeAction(args, [result]));
		action.appendHistory = this.appendToHistory(theLength ? historyName : null);
	}

	this.setEntryField("");
	this.refresh();
	return false;
};

Calculator.prototype.storeCookies = function () {
	document.cookie = "rpncalcStack=" + escape(this.stack.join(","));
	document.cookie = "rpncalcNumberFormat=" + escape(this.numberFormat);
	document.cookie = "rpncalcNumberPrecision=" + escape(this.numberPrecision);
	document.cookie = "rpncalcTextAlign=" + escape(this.textAlign);
	document.cookie = "rpncalcEntryMode=" + escape(this.entryMode);
};

Calculator.prototype.refresh = function () {
	this.refreshStack();
	this.refreshStatus();
	this.storeCookies(); // yeah, I'm only doing this here because it happens
	// to be a convenient point at which to do it.
};

Calculator.prototype.loadCookies = function () {
	var cookieJar = new Object();
	var cookies = document.cookie.split("; ");
	for (var i = 0; i < cookies.length; ++i) {
		var nv = cookies[i].split("=");
		if (nv.length >= 2) {
			cookieJar[nv[0]] = unescape(nv[1]);
		} else {
			cookieJar[nv[0]] = null; // msie
		}
	}
	if ("rpncalcStack" in cookieJar) {
		if (!cookieJar["rpncalcStack"]) {
			this.stack = new Array();
		} else {
			this.stack = cookieJar["rpncalcStack"].split(",");
			for (i = 0; i < this.stack.length; ++i) {
				this.stack[i] = parseFloat(this.stack[i]);
			}
		}
	}
	if ("rpncalcNumberFormat" in cookieJar) {
		this.numberFormat = cookieJar["rpncalcNumberFormat"];
	}
	if ("rpncalcNumberPrecision" in cookieJar) {
		this.numberPrecision = cookieJar["rpncalcNumberPrecision"];
	}
	if ("rpncalcTextAlign" in cookieJar) {
		this.textAlign = cookieJar["rpncalcTextAlign"];
	}
	if ("rpncalcEntryMode" in cookieJar) {
		var mode = cookieJar["rpncalcEntryMode"];
		this.setEntryMode(mode);
	}
	this.refresh();
};

/* must be defined AFTER all key press event functions are defined. */
Calculator.prototype.keyPressEventFunctions = {
	"numeric":	Calculator.prototype.numericModeKeyPressEvent,
	"function":	Calculator.prototype.functionModeKeyPressEvent,
	"store":	Calculator.prototype.registerStoreModeKeyPressEvent,
	"recall":	Calculator.prototype.registerRecallModeKeyPressEvent,
	/*-----------------------------------------------------------------------*/
	"dummy":	0
};

/* Local Variables: */
/* tab-stop-list: (4 8 12 16 20 24 28 32 36 40 44 48 52 56 60 64 68 72 76 80 84 88 92 96 100 104 108 112 116 120 124 128) */
/* tab-width: 4 */
/* End: */
