#!/usr/bin/env node

'use strict';

const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const bondage = require('../bondage.js');
const Lexer = require('../lexer/lexer.js');
const Parser = require('../parser.js');

function showTokens(files) {
  // First, load all of the files that we were given
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file));
    for (const i in data) {
      const lexer = new Lexer()
      lexer.setInput(data[i]['body']);
      let token = '';
      console.log("Debug: Tokens:")
      while (token !== 'EndOfInput' && token !== 'Invalid') {
        token = lexer.lex()
        const yytext = lexer.yytext != '' ? `(${lexer.yytext}) ` : '';
        console.log(`${token} ${yytext}at ${lexer.yylineno}:${lexer.yylloc.first_column} ( line ${lexer.yylineno})`);
      }
      console.log("")
    }
  }
}

function showParse(files) {
  // First, load all of the files that we were given
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file));
    for (const i in data) {
      console.log(Parser.parse(data[i]['body']))
    }
  }
}

program
  .description('Compile given yarn file')
  .option('-t, --tokens', 'Display the tokns emitted by the lexer')
  .option('-p, --parse', 'Display the tree parsed by the parser')
  .arguments('<file...>')
  .action((files, options) => {
    if (options.tokens) {
      showTokens(files);
    } else if (options.parse) {
      showParse(files);
    }
  });

program.parse(process.argv);
