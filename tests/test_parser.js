/* eslint no-unused-expressions: "off" */
/* eslint-env mocha */

'use strict';

const chai = require('chai');
const parser = require('../src/parser/parser.js');
const nodes = require('../src/parser/nodes.js');

const expect = chai.expect;

describe('Parser', () => {
  it('can parse simple text', () => {
    const results = parser.parse('some text');

    const expected = [
      new nodes.TextNode('some text'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse an option', () => {
    const results = parser.parse('[[optiondest]]');

    const expected = [
      new nodes.LinkNode('optiondest'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse a named option', () => {
    const results = parser.parse('[[option text|optiondest]]');

    const expected = [
      new nodes.LinkNode('option text', 'optiondest'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse several named options', () => {
    const results = parser.parse('[[text1|dest1]][[text2|dest2]]\n[[text3|dest3]]');

    const expected = [
      new nodes.LinkNode('text1', 'dest1'),
      new nodes.LinkNode('text2', 'dest2'),
      new nodes.LinkNode('text3', 'dest3'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse some text followed by an option', () => {
    const results = parser.parse('some text [[optiondest]]');

    const expected = [
      new nodes.TextNode('some text '),
      new nodes.LinkNode('optiondest'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse some text followed by a newline and an option', () => {
    const results = parser.parse('some text\n[[optiondest]]');

    const expected = [
      new nodes.TextNode('some text'),
      new nodes.LinkNode('optiondest'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse some text followed by a newline and a command', () => {
    const results = parser.parse('some text\n<<commandtext>>');

    const expected = [
      new nodes.TextNode('some text'),
      new nodes.CommandNode('commandtext'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse a shortcut command', () => {
    const results = parser.parse('text\n-> shortcut1\n\tText1\n-> shortcut2\n\tText2\nmore text');

    const expected = [
      new nodes.TextNode('text'),
      new nodes.DialogOptionNode('shortcut1', [new nodes.TextNode('Text1')]),
      new nodes.DialogOptionNode('shortcut2', [new nodes.TextNode('Text2')]),
      new nodes.TextNode('more text'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('can parse nested shortcut commands', () => {
    const results = parser.parse('text\n-> shortcut1\n\tText1\n\t-> nestedshortcut1\n\t\tNestedText1\n\t-> nestedshortcut2\n\t\tNestedText2\n-> shortcut2\n\tText2\nmore text');

    const expected = [
      new nodes.TextNode('text'),
      new nodes.DialogOptionNode('shortcut1', [
        new nodes.TextNode('Text1'),
        new nodes.DialogOptionNode('nestedshortcut1', [
          new nodes.TextNode('NestedText1'),
        ]),
        new nodes.DialogOptionNode('nestedshortcut2', [
          new nodes.TextNode('NestedText2'),
        ]),
      ]),
      new nodes.DialogOptionNode('shortcut2', [new nodes.TextNode('Text2')]),
      new nodes.TextNode('more text'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('correctly ignores a double newline', () => {
    const results = parser.parse('some text\n\n<<commandtext>>');

    const expected = [
      new nodes.TextNode('some text'),
      new nodes.CommandNode('commandtext'),
    ];

    expect(results).to.deep.equal(expected);
  });

  it('correctly ignores a bunch of newlines', () => {
    const results = parser.parse('some text\n\n\n\n\n\n<<commandtext>>\n');

    const expected = [
      new nodes.TextNode('some text'),
      new nodes.CommandNode('commandtext'),
    ];

    expect(results).to.deep.equal(expected);
  });
});
