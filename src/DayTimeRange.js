const utils = require('./utils');

module.exports = class DayTimeRange {
  /**
   * Constructor
   * 
   * @param {Number} day 
   * @param {Date} start 
   * @param {Date} end 
   */
  constructor(day, start, end) {
    this.day = day;
    this.start = start;
    this.end = end;
  }

  /**
   * Formats the time range to be printed
   * 
   * @returns {String} Formatted string to print
   */
  toString() {
    return (
      this.day
      + ' ' + utils.withLeadingZero(this.start.getUTCHours()) + ':' + utils.withLeadingZero(this.start.getUTCMinutes())
      + '-' + utils.withLeadingZero(this.end.getUTCHours()) + ':' + utils.withLeadingZero(this.end.getUTCMinutes())
    );
  }
};