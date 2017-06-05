#!/usr/bin/env node

'use strict';

const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const bondage = require('../src/bondage.js');
const Lexer = require('../src/lexer/lexer.js');

function runDialogue(files) {
  let node = program.startNode;
  if (node === undefined) {
    node = 'Start';
  }

  const dialogue = new bondage.Dialogue();

  // First, load all of the files that we were given
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file));
    dialogue.load(data);
  }

  const d = dialogue.run(node);

  const goUntilOptions = () => {
    for (const result of d) {
      if (result instanceof bondage.OptionsResult) {
        break;
      }
    }
  };

  // Then, set up the listeners
  dialogue.on('line', (result) => {
    console.log(result.text); // eslint-disable-line no-console
  });
  dialogue.on('options', (result) => {
    // Create a dialogue prompt to ask the player to choose
    inquirer.prompt([{
      name: 'response',
      message: ' ',
      choices: result.options,
      type: 'list',
    }]).then((answer) => {
      // Tell the dialogue which option was chosen
      result.choose(answer.response);

      // Continue
      goUntilOptions();
    });
  });

  // Finally, run the dialogue up until an options menu
  goUntilOptions();
}

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

// Set up the program
program
  .command('start')
  .description('Spin the yarn')
  .arguments('<file...>')
  .option('-s, --start-node [name]', 'The name of the node to start from [Start]')
  .action((files) => {
    runDialogue(files);
  });

program
  .command('test')
  .description('Test a given yarn file')
  .option('-t, --tokens', 'Display the tokens parsed by the lexer')
  .arguments('<file...>')
  .action((files) => {
    showTokens(files);
  });

program.parse(process.argv);
