const Parser = require('jison').Parser;

const grammar = {
  lex: {
    rules: [
      ['\\n', 'return "NEWLINE";'],
      ['$', 'return "EOF";'],
      ['.*', 'return "TEXT";'],
    ],
  },
  bnf: {
    node: [
      ['lines EOF', 'return $1;'],
    ],
    lines: [
      ['lines NEWLINE line', '$1.push($3); $$ = $1;'],
      ['NEWLINE line', '$$ = [$2];'],
      ['line', '$$ = [$1];'],
    ],
    line: [
      ['TEXT', '$$ = $1;'],
    ],
  },
};

const parser = new Parser(grammar);

console.log(parser.parse('HI'))
console.log(parser.parse('HI\nHI'))
console.log(parser.parse(' \nHI'))
console.log(parser.parse('\nHI'))
// console.log(parser.parse('[[hi]]'));
// console.log(parser.parse('[[hi|yo]]'));
// console.log(parser.parse('abc 123'));
// console.log(parser.parse('abc123 fcx'));
