const Parser = require('jison').Parser;
const Lexer = require('./lexer.js');

const grammar = {
  bnf: {
    node: [
      ['statements EOF', 'return $1'],
    ],
    statements: [
      ['statements NEWLINE statement', '$1.push($3); $$ = $1'],
      ['statements statement', '$1.push($2); $$ = $1'],
      ['statement', '$$ = [$1]'],
    ],
    statement: [
      ['TEXT', '$$ = { text: $1, type: "text" }'],
      ['OPTSTART TEXT OPTEND', '$$ = { dest: $2, type: "option" }'],
      ['OPTSTART TEXT OPTSEP IDENTIFIER OPTEND', '$$ = { text: $2, dest: $4, type: "option" }'],
      ['CMDSTART TEXT CMDEND', '$$ = { text: $2, type: "command" }'],
    ],
  },
};

const parser = new Parser(grammar);
parser.lexer = new Lexer();

module.exports = parser;
