/* eslint no-unused-expressions: "off" */
/* eslint-env mocha */

'use strict';

const chai = require('chai');
const Lexer = require('../src/lexer/lexer.js');

const expect = chai.expect;

describe('Lexer', () => {
  it('can tokenize some text', () => {
    const lexer = new Lexer();
    lexer.setInput('This is some text');

    expect(lexer.lex()).to.equal('Text');
  });

  it('can tokenize an option', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option]]');

    expect(lexer.lex()).to.equal('OptionStart');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionEnd');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize a named option', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option|dest]]');

    expect(lexer.lex()).to.equal('OptionStart');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionDelimit');
    expect(lexer.lex()).to.equal('Identifier');
    expect(lexer.lex()).to.equal('OptionEnd');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize some text followed by an option', () => {
    const lexer = new Lexer();
    lexer.setInput('text [[option]]');

    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionStart');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionEnd');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize an option followed by some text', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option]] text');

    expect(lexer.lex()).to.equal('OptionStart');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionEnd');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize a named option followed by some text', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option|blah]] text');

    expect(lexer.lex()).to.equal('OptionStart');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionDelimit');
    expect(lexer.lex()).to.equal('Identifier');
    expect(lexer.lex()).to.equal('OptionEnd');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize a command', () => {
    const lexer = new Lexer();
    lexer.setInput('<<option>>');

    expect(lexer.lex()).to.equal('BeginCommand');
    expect(lexer.lex()).to.equal('CommandCall');
    expect(lexer.lex()).to.equal('EndCommand');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize shortcut options', () => {
    const lexer = new Lexer();
    lexer.setInput('text\n-> shortcut1\n\tText1\n-> shortcut2\n\tText2\nmore text');

    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('ShortcutOption');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Indent');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Dedent');
    expect(lexer.lex()).to.equal('ShortcutOption');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Indent');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Dedent');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize nested shortcut options', () => {
    const lexer = new Lexer();
    lexer.setInput('text\n-> shortcut1\n\tText1\n\t-> nestedshortcut1\n\t\tNestedText1\n\t-> nestedshortcut2\n\t\tNestedText2\n-> shortcut2\n\tText2\nmore text');

    expect(lexer.lex()).to.equal('Text');

    expect(lexer.lex()).to.equal('ShortcutOption');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Indent');

    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('ShortcutOption');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Indent');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Dedent');

    expect(lexer.lex()).to.equal('ShortcutOption');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Indent');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Dedent');

    expect(lexer.lex()).to.equal('Dedent');

    expect(lexer.lex()).to.equal('ShortcutOption');
    expect(lexer.lex()).to.equal('Text');

    expect(lexer.lex()).to.equal('Indent');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('Dedent');

    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize a simple command', () => {
    const lexer = new Lexer();
    lexer.setInput('<<testcommand>>');

    expect(lexer.lex()).to.equal('BeginCommand');
    expect(lexer.lex()).to.equal('CommandCall');
    expect(lexer.lex()).to.equal('EndCommand');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize a simple assignment', () => {
    const lexer = new Lexer();
    lexer.setInput('<<set $testvar = -4.3>>');

    expect(lexer.lex()).to.equal('BeginCommand');
    expect(lexer.lex()).to.equal('Set');
    expect(lexer.lex()).to.equal('Variable');
    expect(lexer.lex()).to.equal('EqualToOrAssign');
    expect(lexer.lex()).to.equal('Number');
    expect(lexer.lex()).to.equal('EndCommand');
    expect(lexer.lex()).to.equal('EndOfInput');
  });

  it('can tokenize an assignment involving arithmetic', () => {
    const lexer = new Lexer();
    lexer.setInput('<<set $testvar = -4.3 - (1 + 2) * 3.1 / 5>>');

    expect(lexer.lex()).to.equal('BeginCommand');
    expect(lexer.lex()).to.equal('Set');
    expect(lexer.lex()).to.equal('Variable');
    expect(lexer.lex()).to.equal('EqualToOrAssign');
    expect(lexer.lex()).to.equal('Number');
    expect(lexer.lex()).to.equal('Minus');
    expect(lexer.lex()).to.equal('LeftParen');
    expect(lexer.lex()).to.equal('Number');
    expect(lexer.lex()).to.equal('Add');
    expect(lexer.lex()).to.equal('Number');
    expect(lexer.lex()).to.equal('RightParen');
    expect(lexer.lex()).to.equal('Multiply');
    expect(lexer.lex()).to.equal('Number');
    expect(lexer.lex()).to.equal('Divide');
    expect(lexer.lex()).to.equal('Number');
    expect(lexer.lex()).to.equal('EndCommand');
    expect(lexer.lex()).to.equal('EndOfInput');
  });
});
