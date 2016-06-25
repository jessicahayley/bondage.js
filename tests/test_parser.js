/* eslint no-unused-expressions: "off" */
/* eslint-env mocha */

'use strict';

const chai = require('chai');
const expect = chai.expect;
const parser = require('../src/parser.js');

describe('Parser', () => {
  it('can parse simple text', () => {
    const results = parser.parse('some text');

    const expected = [
      { text: 'some text', type: 'text' },
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse an option', () => {
    const results = parser.parse('[[optiondest]]');

    const expected = [
      { dest: 'optiondest', type: 'option' },
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse a named option', () => {
    const results = parser.parse('[[option text|optiondest]]');

    const expected = [
      { dest: 'optiondest', text: 'option text', type: 'option' },
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse several named options', () => {
    const results = parser.parse('[[text1|dest1]][[text2|dest2]]\n[[text3|dest3]]');

    const expected = [
      { dest: 'dest1', text: 'text1', type: 'option' },
      { dest: 'dest2', text: 'text2', type: 'option' },
      { dest: 'dest3', text: 'text3', type: 'option' },
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse some text followed by an option', () => {
    const results = parser.parse('some text[[optiondest]]');

    const expected = [
      { text: 'some text', type: 'text' },
      { dest: 'optiondest', type: 'option' },
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse some text followed by a newline and an option', () => {
    const results = parser.parse('some text\n[[optiondest]]');

    const expected = [
      { text: 'some text', type: 'text' },
      { dest: 'optiondest', type: 'option' },
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse some text followed by a newline and a command', () => {
    const results = parser.parse('some text\n<<commandtext>>');

    const expected = [
      { text: 'some text', type: 'text' },
      { text: 'commandtext', type: 'command' },
    ];

    expect(results).to.deep.equal(expected);
  });
});
