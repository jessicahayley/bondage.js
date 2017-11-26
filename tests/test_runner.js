/* eslint no-unused-expressions: "off" */
/* eslint-env mocha */

'use strict';

const fs = require('fs');
const chai = require('chai');
const bondage = require('../src/bondage.js');

const expect = chai.expect;

describe('Dialogue', () => {
  let oneNodeYarnData;
  let threeNodeYarnData;
  let namedLinkYarnData;
  let shortcutsYarnData;

  let runner;

  before(() => {
    oneNodeYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/onenode.json'));
    threeNodeYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/threenodes.json'));
    namedLinkYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/namedlink.json'));
    shortcutsYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/shortcuts.json'));
  });

  beforeEach(() => {
    runner = new bondage.Runner();
  });

  it('Can run through a single node', () => {
    runner.load(oneNodeYarnData);
    const run = runner.run('Start');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is a test line'));
    expect(run.next().done).to.be.true;
  });

  it('Can start at a different node', () => {
    runner.load(threeNodeYarnData);
    const run = runner.run('Option2');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is Option2\'s test line'));
    expect(run.next().done).to.be.true;
  });

  it('Can run through a link to another node', () => {
    runner.load(threeNodeYarnData);
    const run = runner.run('Start');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is a test line'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is another test line'));

    const optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionResult(['Option1', 'Option2']));

    optionResult.select(0);
    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is Option1\'s test line'));

    expect(run.next().done).to.be.true;
  });
  it('Can run through a named link to another node', () => {
    runner.load(namedLinkYarnData);
    const run = runner.run('Start');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is a test line'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is another test line'));

    const optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionResult(['Option1', 'Option2']));

    optionResult.select(1);
    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is Dest2\'s test line'));

    expect(run.next().done).to.be.true;
  });

  it('Can run through shortcuts', () => {
    runner.load(shortcutsYarnData);
    const run = runner.run('NonNested');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is a test line'));

    const optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionResult(['Option 1', 'Option 2']));

    optionResult.select(1);
    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is the second option'));

    expect(run.next().value).to.deep.equal(new bondage.TextResult('This is after both options'));
    expect(run.next().done).to.be.true;
  });
  it('Can run through nested shortcuts', () => {
    runner.load(shortcutsYarnData);
    const run = runner.run('Nested');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('text'));

    let optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionResult(['shortcut1', 'shortcut2']));

    optionResult.select(0);
    expect(run.next().value).to.deep.equal(new bondage.TextResult('Text1'));

    optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionResult(['nestedshortcut1', 'nestedshortcut2']));

    optionResult.select(1);
    expect(run.next().value).to.deep.equal(new bondage.TextResult('NestedText2'));

    expect(run.next().value).to.deep.equal(new bondage.TextResult('more text'));
    expect(run.next().done).to.be.true;
  });
});
