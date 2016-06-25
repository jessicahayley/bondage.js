/* eslint no-unused-expressions: "off" */
/* eslint-env mocha */

'use strict';

const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const yarn = require('../src/bondage.js');

describe('Dialogue', () => {
  let dialogue;

  let oneNodeYarnData;
  let threeNodeYarnData;
  let namedLinkYarnData;
  let commandsYarnData;

  const loopToFinish = it => {
    // Loop over the given iterator until it finishes

    // eslint-disable-next-line no-unused-vars, no-empty
    for (const _ of it) { }
  };

  before(() => {
    oneNodeYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/onenode.json'));
    threeNodeYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/threenodes.json'));
    namedLinkYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/namedlink.json'));
    commandsYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/commands.json'));
  });

  beforeEach(() => {
    dialogue = new yarn.Dialogue();
  });

  it('emits a line event if it gets a line result', () => {
    let lineCallbackCalled = false;

    dialogue.on('line', (result) => {
      lineCallbackCalled = true;
      expect(result).to.be.an.instanceof(yarn.LineResult);
    });

    dialogue.runner.run = () => { return [new yarn.LineResult()]; };

    dialogue.run().next();

    expect(lineCallbackCalled).to.be.true;
  });

  it('emits an options event if it gets an options result', () => {
    let optionsCallbackCalled = false;

    dialogue.on('options', (result) => {
      optionsCallbackCalled = true;

      expect(result).to.be.an.instanceof(yarn.OptionsResult);
    });

    dialogue.runner.run = () => { return [new yarn.OptionsResult()]; };

    loopToFinish(dialogue.run());

    expect(optionsCallbackCalled).to.be.true;
  });

  it('emits an command event if it gets an command result', () => {
    let commandCallbackCalled = false;

    dialogue.on('command', (result) => {
      commandCallbackCalled = true;

      expect(result).to.be.an.instanceof(yarn.CommandResult);
    });

    dialogue.runner.run = () => { return [new yarn.CommandResult()]; };

    loopToFinish(dialogue.run());

    expect(commandCallbackCalled).to.be.true;
  });

  it('emits a nodecomplete event if it gets an node complete result', () => {
    let nodecompleteCallbackCalled = false;

    dialogue.on('nodecomplete', (result) => {
      nodecompleteCallbackCalled = true;
      expect(result).to.be.an.instanceof(yarn.NodeCompleteResult);
    });

    dialogue.runner.run = () => { return [new yarn.NodeCompleteResult()]; };

    loopToFinish(dialogue.run());

    expect(nodecompleteCallbackCalled).to.be.true;
  });

  it('emits result events in order that they are given', () => {
    const resultsCalled = [];

    dialogue.on('line', () => {
      resultsCalled.push('line');
    });
    dialogue.on('options', () => {
      resultsCalled.push('options');
    });
    dialogue.on('nodecomplete', () => {
      resultsCalled.push('nodecomplete');
    });

    dialogue.runner.run = () => {
      return [
        new yarn.OptionsResult(),
        new yarn.NodeCompleteResult(),
        new yarn.LineResult(),
      ];
    };

    loopToFinish(dialogue.run());

    expect(resultsCalled).to.deep.equal(['options', 'nodecomplete', 'line']);
  });

  it('emits a start and finish result before/after other results', () => {
    const resultsCalled = [];

    dialogue.on('start', () => {
      resultsCalled.push('start');
    });
    dialogue.on('finish', () => {
      resultsCalled.push('finish');
    });
    dialogue.on('line', () => {
      resultsCalled.push('line');
    });

    dialogue.runner.run = () => { return [new yarn.LineResult()]; };

    loopToFinish(dialogue.run());

    expect(resultsCalled).to.deep.equal(['start', 'line', 'finish']);
  });

  it('is able to load yarn data into the runner', () => {
    const outputData = {
      Start: {
        tags: 'Tag',
        body: 'This is a test line',
      },
    };

    expect(dialogue.runner.nodes).to.deep.equal({});

    dialogue.load(oneNodeYarnData);

    expect(dialogue.runner.nodes).to.deep.equal(outputData);
  });

  it('is able to run through yarn data with named options, when choosing the first option', () => {
    // We'll keep track of all lines to make sure they were given in order
    // Whenever options appear, we'll just say [[OPTIONS]] so we know they were displayed
    const lines = [];

    const expectedLines = [
      'This is a test line',
      'This is another test line',
      '[[OPTIONS]]',
      'This is Dest1\'s test line',
    ];

    const expectedOptions = [
      'Option1',
      'Option2',
    ];

    dialogue.load(namedLinkYarnData);

    dialogue.on('line', (result) => {
      lines.push(result.text);
    });
    dialogue.on('options', (result) => {
      lines.push('[[OPTIONS]]'); // Just to make sure they were displayed in the correct place
      expect(result.options).to.deep.equal(expectedOptions);

      result.choose(result.options[0]);
    });

    loopToFinish(dialogue.run());

    expect(lines).to.deep.equal(expectedLines);
  });

  it('is able to run through yarn data with options, when choosing the first option', () => {
    // We'll keep track of all lines to make sure they were given in order
    // Whenever options appear, we'll just say [[OPTIONS]] so we know they were displayed
    const lines = [];

    const expectedLines = [
      'This is a test line',
      'This is another test line',
      '[[OPTIONS]]',
      'This is Option1\'s test line',
    ];

    const expectedOptions = [
      'Option1',
      'Option2',
    ];

    dialogue.load(threeNodeYarnData);

    dialogue.on('line', (result) => {
      lines.push(result.text);
    });
    dialogue.on('options', (result) => {
      lines.push('[[OPTIONS]]'); // Just to make sure they were displayed in the correct place
      expect(result.options).to.deep.equal(expectedOptions);

      result.choose(result.options[0]);
    });

    loopToFinish(dialogue.run());

    expect(lines).to.deep.equal(expectedLines);
  });

  it('is able to run through yarn data with an option, when choosing the second option', () => {
    // We'll keep track of all lines to make sure they were given in order
    // Whenever options appear, we'll just say [[OPTIONS]] so we know they were displayed
    const lines = [];

    const expectedLines = [
      'This is a test line',
      'This is another test line',
      '[[OPTIONS]]',
      'This is Option2\'s test line',
    ];

    const expectedOptions = [
      'Option1',
      'Option2',
    ];

    dialogue.load(threeNodeYarnData);

    dialogue.on('line', (result) => {
      lines.push(result.text);
    });
    dialogue.on('options', (result) => {
      lines.push('[[OPTIONS]]'); // Just to make sure they were displayed in the correct place
      expect(result.options).to.deep.equal(expectedOptions);

      result.choose(result.options[1]);
    });

    loopToFinish(dialogue.run());

    expect(lines).to.deep.equal(expectedLines);
  });

  it('emits a nodecomplete event when it finishes parsing a node', () => {
    // We'll keep track of all lines to make sure they were given in order
    const lines = [];

    const expectedLines = [
      'This is a test line',
      'This is another test line',
      'NODECOMPLETE: Start',
      'This is Option1\'s test line',
      'NODECOMPLETE: Option1',
    ];

    dialogue.load(threeNodeYarnData);

    dialogue.on('line', (result) => {
      lines.push(result.text);
    });
    dialogue.on('options', (result) => {
      result.choose(result.options[0]);
    });
    dialogue.on('nodecomplete', (result) => {
      lines.push(`NODECOMPLETE: ${result.nodeName}`);
    });

    loopToFinish(dialogue.run());

    expect(lines).to.deep.equal(expectedLines);
  });

  it('handles commands when they are inline or on their own line', () => {
    // We'll keep track of all lines to make sure they were given in order
    const lines = [];

    const expectedLines = [
      'COMMAND: command1',
      'text in between commands',
      'COMMAND: command2',
      'COMMAND: command3',
    ];

    dialogue.load(commandsYarnData);

    dialogue.on('line', (result) => {
      lines.push(result.text);
    });
    dialogue.on('command', (result) => {
      lines.push(`COMMAND: ${result.command}`);
    });

    loopToFinish(dialogue.run());

    expect(lines).to.deep.equal(expectedLines);
  });
});
