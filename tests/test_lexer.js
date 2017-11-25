/* eslint no-unused-expressions: "off" */
/* eslint-env mocha */

'use strict';

const chai = require('chai');
const expect = chai.expect;
const Lexer = require('../src/lexer/lexer.js');

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
  });

  it('can tokenize a named option', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option|dest]]');

    expect(lexer.lex()).to.equal('OptionStart');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionDelimit');
    expect(lexer.lex()).to.equal('Identifier');
    expect(lexer.lex()).to.equal('OptionEnd');
  });

  it('can tokenize some text followed by an option', () => {
    const lexer = new Lexer();
    lexer.setInput('text [[option]]');

    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionStart');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionEnd');
  });

  it('can tokenize an option followed by some text', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option]] text');

    expect(lexer.lex()).to.equal('OptionStart');
    expect(lexer.lex()).to.equal('Text');
    expect(lexer.lex()).to.equal('OptionEnd');
    expect(lexer.lex()).to.equal('Text');
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
  });

  it('can tokenize a command', () => {
    const lexer = new Lexer();
    lexer.setInput('<<option>>');

    expect(lexer.lex()).to.equal('BeginCommand');
    expect(lexer.lex()).to.equal('Identifier');
    expect(lexer.lex()).to.equal('EndCommand');
  });
});
