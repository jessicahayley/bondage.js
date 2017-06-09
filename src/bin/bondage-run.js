#!/usr/bin/env node

'use strict';

const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const bondage = require('../bondage.js');

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

// Set up the program
program
  .description('Spin the yarn')
  .arguments('<file...>')
  .option('-s, --start-node [name]', 'The name of the node to start from [Start]')
  .action((files) => {
    runDialogue(files);
  });
