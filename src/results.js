'use strict';

class Result {}

class TextResult extends Result {
  /**
   * Create a text display result
   * @param {string} [text] text to be displayed
   * @param {first_column: int, first_line: int, last_column: int, last_line: int} [lineNo] position
   */
  constructor(text, yarnNodeData, lineNo) {
    super();
    this.text = text;
    this.data = yarnNodeData;
    this.lineNo = lineNo;
  }
}

class CommandResult extends Result {
  /**
   * Return a command string
   * @param {string} [text] text to be displayed
   * @param {first_column: int, first_line: int, last_column: int, last_line: int} [lineNo] position
   */
  constructor(text, yarnNodeData, lineNo) {
    super();
    this.text = text;
    this.data = yarnNodeData;
    this.lineNo = lineNo;
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

module.exports = { Result, TextResult, CommandResult, OptionsResult };
