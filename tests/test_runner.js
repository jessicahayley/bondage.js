/* eslint no-unused-expressions: "off" */
/* eslint-env mocha */

'use strict';

const fs = require('fs');
const chai = require('chai');
const bondage = require('../src/bondage.js');

const expect = chai.expect;

describe('Dialogue', () => {
  let linksYarnData;
  let shortcutsYarnData;
  let assignmentYarnData;
  let conditionalYarnData;
  let commandAndFunctionYarnData;

  let runner;

  before(() => {
    linksYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/links.json'));
    shortcutsYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/shortcuts.json'));
    assignmentYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/assignment.json'));
    conditionalYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/conditions.json'));
    commandAndFunctionYarnData = JSON.parse(fs.readFileSync('./tests/yarn_files/commandsandfunctions.json'));
  });

  beforeEach(() => {
    runner = new bondage.Runner();
  });

  it('Can run through a single node', () => {
    runner.load(linksYarnData);
    const run = runner.run('OneNode');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is a test line', value.data, value.lineNum));
    expect(run.next().done).to.be.true;
  });

  it('Can start at a different node', () => {
    runner.load(linksYarnData);
    const run = runner.run('Option2');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is Option2\'s test line', value.data, value.lineNum));
    expect(run.next().done).to.be.true;
  });

  it('Can run through a link to another node', () => {
    runner.load(linksYarnData);
    const run = runner.run('ThreeNodes');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is a test line', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is another test line', value.data, value.lineNum));

    const optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionsResult(['Option1', 'Option2'], [2, 3]));

    optionResult.select(0);
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is Option1\'s test line', value.data, value.lineNum));

    expect(run.next().done).to.be.true;
  });

  it('Can run through a named link to another node', () => {
    runner.load(linksYarnData);
    const run = runner.run('NamedLink');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is a test line', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is another test line', value.data, value.lineNum));

    const optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionsResult(['First choice', 'Second choice'], [3, 4]));

    optionResult.select(1);
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is Option2\'s test line', value.data, value.lineNum));

    expect(run.next().done).to.be.true;
  });

  it('Automatically goes to the linked node, if only one link is given', () => {
    runner.load(linksYarnData);
    const run = runner.run('OneLinkPassthrough');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('First test line', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is Option1\'s test line', value.data, value.lineNum));
    expect(run.next().done).to.be.true;
  });

  it('Does not group together link and shortcut options', () => {
    runner.load(linksYarnData);
    const run = runner.run('LinkAfterShortcuts');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('First test line', value.data, value.lineNum));

    let optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionsResult(['Shortcut 1', 'Shortcut 2'], [2, 4]));

    optionResult.select(1);
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is the second shortcut', value.data, value.lineNum));

    optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionsResult(['First link', 'Second link'], [6, 6]));

    optionResult.select(0);
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is Option1\'s test line', value.data, value.lineNum));

    expect(run.next().done).to.be.true;
  });

  it('Can run through shortcuts', () => {
    runner.load(shortcutsYarnData);
    const run = runner.run('NonNested');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is a test line', value.data, value.lineNum));

    const optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionsResult(['Option 1', 'Option 2'], [2, 4]));

    optionResult.select(1);
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is the second option', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is after both options', value.data, value.lineNum));
    expect(run.next().done).to.be.true;
  });

  it('Can run through nested shortcuts', () => {
    runner.load(shortcutsYarnData);
    const run = runner.run('Nested');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('text', value.data, value.lineNum));

    let optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionsResult(['shortcut1', 'shortcut2'], [2, 8]));

    optionResult.select(0);
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Text1', value.data, value.lineNum));

    optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionsResult(['nestedshortcut1', 'nestedshortcut2'], [4, 6]));

    optionResult.select(1);
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('NestedText2', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('more text', value.data, value.lineNum));
    expect(run.next().done).to.be.true;
  });

  it('Can exclude a conditional shortcut', () => {
    runner.load(shortcutsYarnData);
    const run = runner.run('Conditional');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is a test line', value.data, value.lineNum));

    const optionResult = run.next().value;
    expect(optionResult).to.deep.equal(new bondage.OptionsResult(['Option 1', 'Option 3'], [2, 6]));

    optionResult.select(1);
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is the third option', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('This is after both options', value.data, value.lineNum));
    expect(run.next().done).to.be.true;
  });

  it('Can evaluate a numeric assignment', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('Numeric');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.be.undefined;

    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line After', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.equal(-123.4);

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate a numeric assignment with an expression', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('NumericExpression');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.be.undefined;

    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line After', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.equal(((1 + 2) * -3) + 4.3);

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate an string assignment', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('String');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.be.undefined;

    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line After', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.equal('Variable String');

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate a string assignment with an expression', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('StringExpression');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.be.undefined;

    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line After', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.equal('Variable String Appended');

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate a boolean assignment', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('Boolean');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.be.undefined;

    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line After', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.equal(true);

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate a boolean assignment with expression', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('BooleanExpression');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.be.undefined;

    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line After', value.data, value.lineNum));

    expect(runner.variables.get('testvar')).to.equal(true);

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate an assignment from one variable to another', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('Variable');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line', value.data, value.lineNum));

    expect(runner.variables.get('firstvar')).to.be.undefined;
    expect(runner.variables.get('secondvar')).to.be.undefined;

    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line After', value.data, value.lineNum));

    expect(runner.variables.get('secondvar')).to.equal('First variable string');

    expect(run.next().done).to.be.true;
  });

  it('Can evaluate an assignment from one variable to another via an expression', () => {
    runner.load(assignmentYarnData);
    const run = runner.run('VariableExpression');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line', value.data, value.lineNum));

    expect(runner.variables.get('firstvar')).to.be.undefined;
    expect(runner.variables.get('secondvar')).to.be.undefined;

    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Test Line After', value.data, value.lineNum));

    expect(runner.variables.get('secondvar')).to.equal(-4.3 + 100);

    expect(run.next().done).to.be.true;
  });

  it('Can handle an if conditional', () => {
    runner.load(conditionalYarnData);
    const run = runner.run('BasicIf');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Text before', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Inside if', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Text after', value.data, value.lineNum));

    expect(run.next().done).to.be.true;
  });

  it('Can handle an if else conditional', () => {
    runner.load(conditionalYarnData);
    const run = runner.run('BasicIfElse');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Text before', value.data, value.lineNum, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Inside else', value.data, value.lineNum, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Text after', value.data, value.lineNum, value.lineNum));

    expect(run.next().done).to.be.true;
  });

  it('Can handle an if else if conditional', () => {
    runner.load(conditionalYarnData);
    const run = runner.run('BasicIfElseIf');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Text before', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Inside elseif', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Text after', value.data, value.lineNum));

    expect(run.next().done).to.be.true;
  });

  it('Can handle an if else if else conditional', () => {
    runner.load(conditionalYarnData);
    const run = runner.run('BasicIfElseIfElse');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Text before', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Inside else', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Text after', value.data, value.lineNum));

    expect(run.next().done).to.be.true;
  });

  it('Halts when given the <<stop>> command', () => {
    runner.load(commandAndFunctionYarnData);
    const run = runner.run('StopCommand');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('First line', value.data, value.lineNum));
    expect(run.next().done).to.be.true;
  });

  it('Returns a command to the user', () => {
    runner.load(commandAndFunctionYarnData);
    const run = runner.run('BasicCommands');

    let value = run.next().value;
    expect(value.data).to.not.be.undefined;
    expect(value).to.deep.equal(new bondage.CommandResult('command', value.data, value.lineNum));
    value = run.next().value;
    expect(value.data).to.not.be.undefined;
    expect(value).to.deep.equal(new bondage.TextResult('text in between commands', value.data, value.lineNum));
    value = run.next().value;
    expect(value.data).to.not.be.undefined;
    expect(value).to.deep.equal(new bondage.CommandResult('command with space', value.data, value.lineNum));
    value = run.next().value;
    expect(value.data).to.not.be.undefined;
    expect(value).to.deep.equal(new bondage.CommandResult('callFunction()', value.data, value.lineNum));
    value = run.next().value;
    expect(value.data).to.not.be.undefined;
    expect(value).to.deep.equal(new bondage.CommandResult('callFunctionWithParam(\"test\",true,1,12.5,[2,3])', value.data, value.lineNum));
  });

  it('Evaluates a function and uses it in a conditional', () => {
    runner.load(commandAndFunctionYarnData);
    const run = runner.run('FunctionConditional');

    runner.registerFunction('testfunc', (args) => {
      if (args[0] === 'firstarg') {
        if (args[1] === 'secondarg') {
          // Test returning true
          return true;
        }
        // Test returning false
        return false;
      }

      throw new Error(`Args ${args} were not expected in testfunc`);
    });

    let value = run.next().value;
    expect(value.data).to.not.be.undefined;
    expect(value).to.deep.equal(new bondage.TextResult('First line', value.data, value.lineNum));
    value = run.next().value;
    expect(value.data).to.not.be.undefined;
    expect(value).to.deep.equal(new bondage.TextResult('This should show', value.data, value.lineNum));
    value = run.next().value;
    expect(value.data).to.not.be.undefined;
    expect(value).to.deep.equal(new bondage.TextResult('After both', value.data, value.lineNum));

    expect(run.next().done).to.be.true;
  });

  it('Correctly defines the built-in visited() function', () => {
    runner.load(commandAndFunctionYarnData);
    const run = runner.run('VisitedFunctionStart');

    let value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('Hello', value.data, value.lineNum));
    value = run.next().value;
    expect(value).to.deep.equal(new bondage.TextResult('you have visited VisitedFunctionStart!', value.data, value.lineNum));

    expect(run.next().done).to.be.true;
  });
});
