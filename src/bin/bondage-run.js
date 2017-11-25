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

  for (const result of d) {
    if (result instanceof bondage.OptionsResult) {
      result.select(1);
    }
  }
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
