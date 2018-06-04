'use strict';

class Result {}

class TextResult extends Result {
  /**
   * Create a text display result
   * @param {string} [text] text to be displayed
   */
  constructor(text) {
    super();
    this.text = text;
  }
}

class CommandResult extends Result { ///NEW
  /**
   * Return commands in the node
   * @param {string} [command] array of text to be displayed
   */
  constructor(command) {
    super();
    this.command = command;
  }
}

class OptionsResult extends Result {
  /**
   * Create a selectable list of options from the given list of text
   * @param {string[]} [options] list of the text of options to be shown
   */
  constructor(options) {
    super();
    this.options = options;
    this.selected = -1;
  }

  select(index) {
    if (index < 0 || index >= this.options.length) {
      throw new Error(`Cannot select option #${index}, there are only ${this.options.length} options`);
    }
    this.selected = index;
  }
}

module.exports = { Result, TextResult, OptionsResult,  CommandResult};
