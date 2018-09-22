'use strict';

/* eslint-disable key-spacing */
/**
 * Token identifier -> regular expression to match the lexeme. That's a list of all the token
 * which can be emitted by the lexer. For now, we're slightly bending the style guide,
 * to make sure the debug output of the javascript lexer will (kinda) match the original C# one.
 */
const Tokens = {
  // Special tokens
  Whitespace:           null,                      // (not used currently)
  Indent:               null,
  Dedent:               null,
  EndOfLine:            null,                      // (not used currently)
  EndOfInput:           null,

  UnaryMinus:           null,                      // -; this is differentiated from Minus
                                                   // when parsing expressions (Not used currently)

  // Literals in ("<<commands>>")
  Number:               /-?[0-9]+(\.[0-9+])?/,
  String:               /"([^"\\]*(?:\\.[^"\\]*)*)"/,

  // Command syntax ("<<foo>>")
  BeginCommand:         /<</,
  EndCommand:           />>/,

  // Variables ("$foo")
  Variable:             /\$([A-Za-z0-9_.])+/,

  // Shortcut syntax ("->")
  ShortcutOption:       /->/,

  // Option syntax ("[[Let's go here|Destination]]")
  OptionStart:          /\[\[/,                    // [[
  OptionDelimit:        /\|/,                      // |
  OptionEnd:            /\]\]/,                    // ]]

  // Command types (specially recognised command word)
  If:                   /if(?!\w)/,
  ElseIf:               /elseif(?!\w)/,
  Else:                 /else(?!\w)/,
  EndIf:                /endif(?!\w)/,
  Set:                  /set(?!\w)/,

  // Boolean values
  True:                 /true(?!\w)/,
  False:                /false(?!\w)/,

  // The null value
  Null:                 /null(?!\w)/,

  // Parentheses
  LeftParen:            /\(/,
  RightParen:           /\)/,

  // Parameter delimiters
  Comma:                /,/,

  // Operators
  EqualTo:              /(==|is(?!\w)|eq(?!\w))/,  // ==, eq, is
  GreaterThan:          /(>|gt(?!\w))/,            // >, gt
  GreaterThanOrEqualTo: /(>=|gte(?!\w))/,          // >=, gte
  LessThan:             /(<|lt(?!\w))/,            // <, lt
  LessThanOrEqualTo:    /(<=|lte(?!\w))/,          // <=, lte
  NotEqualTo:           /(!=|neq(?!\w))/,          // !=, neq

  // Logical operators
  Or:                   /(\|\||or(?!\w))/,         // ||, or
  And:                  /(&&|and(?!\w))/,          // &&, and
  Xor:                  /(\^|xor(?!\w))/,          // ^, xor
  Not:                  /(!|not(?!\w))/,           // !, not

  // this guy's special because '=' can mean either 'equal to'
  // or 'becomes' depending on context
  EqualToOrAssign:      /(=|to(?!\w))/,            // =, to

  Add:                  /\+/,                      // +
  Minus:                /-/,                       // -
  Multiply:             /\*/,                      // *
  Divide:               /\//,                      // /

  AddAssign:            /\+=/,                     // +=
  MinusAssign:          /-=/,                      // -=
  MultiplyAssign:       /\*=/,                     // *=
  DivideAssign:         /\/=/,                     // /=

  Comment:              '//',                      // a run of text that we ignore

  Identifier:           /[a-zA-Z0-9_:.]+/,         // a single word (used for functions)

  CmdIdentifier:        /["'+-=\[\]\*a-zA-Z0-9_:;{}&|.,()]+/,  // a single word (used for commands)

  Text:                 /.*/,                      // a run of text until we hit other syntax.
};
/* eslint-enable key-spacing */

module.exports = Tokens;
