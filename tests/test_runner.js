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
  let assignmentYarnData;
  let conditionalYarnData;

  let runner;

  before(() => {
    oneNodeYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/onenode.json'));
    threeNodeYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/threenodes.json'));
    namedLinkYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/namedlink.json'));
    shortcutsYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/shortcuts.json'));
    assignmentYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/assignment.json'));
    conditionalYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/conditions.json'));
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

  it('Can evaluate a numeric assignment', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('Numeric');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line'));

    expect(runner.variables.get('testvar')).to.be.undefined;

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line After'));

    expect(runner.variables.get('testvar')).to.equal(-123.4);

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate a numeric assignment with an expression', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('NumericExpression');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line'));

    expect(runner.variables.get('testvar')).to.be.undefined;

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line After'));

    expect(runner.variables.get('testvar')).to.equal(((1 + 2) * -3) + 4.3);

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate an string assignment', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('String');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line'));

    expect(runner.variables.get('testvar')).to.be.undefined;

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line After'));

    expect(runner.variables.get('testvar')).to.equal('Variable String');

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate a string assignment with an expression', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('StringExpression');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line'));

    expect(runner.variables.get('testvar')).to.be.undefined;

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line After'));

    expect(runner.variables.get('testvar')).to.equal('Variable String Appended');

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate a boolean assignment', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('Boolean');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line'));

    expect(runner.variables.get('testvar')).to.be.undefined;

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line After'));

    expect(runner.variables.get('testvar')).to.equal(true);

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate a boolean assignment with expression', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('BooleanExpression');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line'));

    expect(runner.variables.get('testvar')).to.be.undefined;

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line After'));

    expect(runner.variables.get('testvar')).to.equal(true);

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate an assignment from one variable to another', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('Variable');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line'));

    expect(runner.variables.get('firstvar')).to.be.undefined;
    expect(runner.variables.get('secondvar')).to.be.undefined;

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line After'));

    expect(runner.variables.get('secondvar')).to.equal('First variable string');

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate an assignment from one variable to another via an expression', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('VariableExpression');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line'));

    expect(runner.variables.get('firstvar')).to.be.undefined;
    expect(runner.variables.get('secondvar')).to.be.undefined;

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Test Line After'));

    expect(runner.variables.get('secondvar')).to.equal(-4.3 + 100);

    expect(run.next().done).to.be.true;
  })

  it('Can handle an if conditional', () => {
    runner.load(conditionalYarnData);
    const run = runner.run('BasicIf');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Text before'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('Inside if'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('Text after'));

    expect(run.next().done).to.be.true;
  });

  it('Can handle an if else conditional', () => {
    runner.load(conditionalYarnData);
    const run = runner.run('BasicIfElse');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Text before'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('Inside else'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('Text after'));

    expect(run.next().done).to.be.true;
  });

  it('Can handle an if else if conditional', () => {
    runner.load(conditionalYarnData);
    const run = runner.run('BasicIfElseIf');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Text before'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('Inside elseif'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('Text after'));

    expect(run.next().done).to.be.true;
  });

  it('Can handle an if else if else conditional', () => {
    runner.load(conditionalYarnData);
    const run = runner.run('BasicIfElseIfElse');

    expect(run.next().value).to.deep.equal(new bondage.TextResult('Text before'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('Inside else'));
    expect(run.next().value).to.deep.equal(new bondage.TextResult('Text after'));

    expect(run.next().done).to.be.true;
  });
});
