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

    expect(lexer.lex()).to.equal('TEXT');
  });

  it('can tokenize an option', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option]]');

    expect(lexer.lex()).to.equal('OPTSTART');
    expect(lexer.lex()).to.equal('TEXT');
    expect(lexer.lex()).to.equal('OPTEND');
  });

  it('can tokenize a named option', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option|dest]]');

    expect(lexer.lex()).to.equal('OPTSTART');
    expect(lexer.lex()).to.equal('TEXT');
    expect(lexer.lex()).to.equal('OPTSEP');
    expect(lexer.lex()).to.equal('IDENTIFIER');
    expect(lexer.lex()).to.equal('OPTEND');
  });

  it('can tokenize some text followed by an option', () => {
    const lexer = new Lexer();
    lexer.setInput('text [[option]]');

    expect(lexer.lex()).to.equal('TEXT');
    expect(lexer.lex()).to.equal('OPTSTART');
    expect(lexer.lex()).to.equal('TEXT');
    expect(lexer.lex()).to.equal('OPTEND');
  });

  it('can tokenize an option followed by some text', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option]] text');

    expect(lexer.lex()).to.equal('OPTSTART');
    expect(lexer.lex()).to.equal('TEXT');
    expect(lexer.lex()).to.equal('OPTEND');
    expect(lexer.lex()).to.equal('TEXT');
  });

  it('can tokenize a named option followed by some text', () => {
    const lexer = new Lexer();
    lexer.setInput('[[option|blah]] text');

    expect(lexer.lex()).to.equal('OPTSTART');
    expect(lexer.lex()).to.equal('TEXT');
    expect(lexer.lex()).to.equal('OPTSEP');
    expect(lexer.lex()).to.equal('IDENTIFIER');
    expect(lexer.lex()).to.equal('OPTEND');
    expect(lexer.lex()).to.equal('TEXT');
  });

  it('can tokenize a command', () => {
    const lexer = new Lexer();
    lexer.setInput('<<option>>');

    expect(lexer.lex()).to.equal('CMDSTART');
    expect(lexer.lex()).to.equal('TEXT');
    expect(lexer.lex()).to.equal('CMDEND');
  });
});
