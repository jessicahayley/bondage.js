'use strict';

const tokens = {
  TEXT: /.*/,

  // Things like function names, node names, etc
  IDENTIFIER: /[A-Za-z0-9_]+/,

  NEWLINE: /\n/,

  OPTSTART: /\[\[/,
  OPTEND: /\]\]/,
  OPTSEP: /\|/,

  CMDSTART: /<</,
  CMDEND: />>/,
};

class LexState {
  constructor() {
    this.transitions = [];
    this.textRule = null;
  }

  addTransition(token, state, delimitsText) {
    this.transitions.push({
      token: token,
      regex: tokens[token],
      state: state || null,
      delimitsText: delimitsText || false,
    });

    return this; // Return this for chaining
  }

  /**
   * A text rule matches all the way up to any of the other transitions in this state
   */
  addTextRule(state) {
    if (this.textRule) {
      throw Error('Cannot add more than one text rule');
    }

    // Go through the regex of the other transitions in this state, and create a regex that will
    // match all text, up to any of those transitions
    const rules = [];
    for (const trans of this.transitions) {
      if (trans.delimitsText) {
        // Surround the rule in parens
        rules.push(`(${trans.regex.source})`);
      }
    }

    // Join the rules that we got above on a |, then put them all into a negative lookahead
    const textPattern = `((?!${rules.join('|')}).)*`;

    this.addTransition('TEXT', state);

    // Update the regex in the transition we just added to our new one
    this.textRule = this.transitions[this.transitions.length - 1];
    this.textRule.regex = new RegExp(textPattern);

    return this; // Return this for chaining
  }
}

class Lexer {
  constructor() {
    this.text = '';

    this.states = {
      base: new LexState().addTransition('OPTSTART', 'option', true)
                          .addTransition('CMDSTART', 'command', true)
                          .addTransition('NEWLINE')
                          .addTextRule(),

      option: new LexState().addTransition('OPTEND', 'base', true)
                            .addTransition('OPTSEP', 'optiondest', true)
                            .addTextRule(),

      optiondest: new LexState().addTransition('OPTEND', 'base')
                                .addTransition('IDENTIFIER'),

      command: new LexState().addTransition('CMDEND', 'base', true)
                             .addTextRule(),
    };

    this.state = 'base';

    this.yytext = '';
  }

  setInput(text) {
    this.text = text;
  }

  lex() {
    if (this.text === '') {
      // Out of tokens to lex
      return 'EOF';
    }

    for (const rule of this.states[this.state].transitions) {
      const match = this.text.match(rule.regex);

      // Only accept valid matches that are at the beginning of the text
      if (match === null || match.index !== 0) continue;

      // Take the matched text off the front of this.text
      const matchedText = match[0];
      this.text = this.text.substr(matchedText.length);

      // Tell the parser what the text for this token is
      this.yytext = matchedText;

      // If the rule points to a new state, change it now
      if (rule.state) {
        this.changeState(rule.state);
      }

      return rule.token;
    }

    throw Error(`Unable to parse past "${this.text}" while in state "${this.state}"`);
  }

  changeState(state) {
    this.state = state;
  }
}

module.exports = Lexer;
