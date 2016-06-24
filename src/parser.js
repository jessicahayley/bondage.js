const Parser = require('jison').Parser;

const grammar = {
  lex: {
    rules: [
      ['\\[\\[', 'return "LINKSTART";'],
      ['\\]\\]', 'return "LINKEND";'],
      ['\\n', 'return "NEWLINE";'],
      ['$', 'return "EOF";'],
      ['.+?(?=\\|)', 'return "LINKTEXT";'],
      ['[A-Za-z0-9]+?(?=\\]\\])', 'return "LINKDEST";'],
      ['\\|', 'return "|";'],
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
      ['link', '$$ = $1;'],
      ['TEXT', '$$ = { text: $1, type: "line" };'],
    ],
    link: [
      ['LINKSTART LINKTEXT | LINKDEST LINKEND', '$$ = { text: $2, dest: $4, type: "namedlink" };'],
      ['LINKSTART LINKDEST LINKEND', '$$ = { dest: $2, type: "link" };'],
    ],
  },
};

const parser = new Parser(grammar);

console.log(parser.parse('HI'))
console.log(parser.parse('HI\nHI'))
console.log(parser.parse(' \nHI'))
console.log(parser.parse('\nHI'))
console.log(parser.parse('[[hi]]'));
console.log(parser.parse('[[hi|yo]]'));
// console.log(parser.parse('abc 123'));
// console.log(parser.parse('abc123 fcx'));
