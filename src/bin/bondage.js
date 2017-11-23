#!/usr/bin/env node

'use strict';

const program = require('commander');

program
  .command('run [files]', 'Run the given yarn files')
  .command('compile [files]', 'Compile the given files')
  .parse(process.argv);
