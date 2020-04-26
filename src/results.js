'use strict';

class Result {}

class TextResult extends Result {
  /**
   * Create a text display result
   * @param {string} [text] text to be displayed
   * @param {int} [lineNum] line number of the result in the node
   */
  constructor(text, yarnNodeData, lineNum) {
    super();
    this.text = text;
    this.data = yarnNodeData;
    this.lineNum = lineNum;
  }
}

class CommandResult extends Result {
  /**
   * Return a command string
   * @param {string} [text] text to be displayed
   * @param {int} [lineNum] line number of the result in the node
   */
  constructor(text, yarnNodeData, lineNum) {
    super();
    this.text = text;
    this.data = yarnNodeData;
    this.lineNum = lineNum;
  }
}

class OptionsResult extends Result {
  /**
   * Create a selectable list of options from the given list of text
   * @param {string[]} [options] list of the text of options to be shown
   * @param {int[]} [lineNum] list of the line numbers of options to be shown
   */
  constructor(options, lineNum) {
    super();
    this.options = options;
    this.lineNum = lineNum;
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
