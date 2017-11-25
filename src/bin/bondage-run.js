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

  const dialogue = new bondage.Runner();

  // First, load all of the files that we were given
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file));
    dialogue.load(data);
  }

  const d = dialogue.run(node);

  const run = () => {
    const result = d.next().value;
    if (!result) {
      return;
    }

    if (result.options) {
      const options = [];
      for (const i in result.options) {
        options.push({ value: i, name: result.options[i] });
      }

      inquirer.prompt([{
        name: 'response',
        message: ' ',
        choices: options,
        type: 'list',
      }]).then((answer) => {
        result.select(answer.response);
        run();
      });
    } else {
      console.log(result.text); // eslint-disable-line
      run();
    }
  };

  run();
}

// Set up the program
program
  .description('Spin the yarn')
  .arguments('<file...>')
  .option('-s, --start-node [name]', 'The name of the node to start from [Start]')
  .action((files) => {
    runDialogue(files);
  });

program.parse(process.argv);
