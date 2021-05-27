const utils = require('./utils');

module.exports = class DayTimeRange {
  constructor(day, start, end) {
    this.day = day;
    this.start = start;
    this.end = end;
  }

  toString() {
    return (
      this.day
      + ' ' + utils.withLeadingZero(this.start.getUTCHours()) + ':' + utils.withLeadingZero(this.start.getUTCMinutes())
      + '-' + utils.withLeadingZero(this.end.getUTCHours()) + ':' + utils.withLeadingZero(this.end.getUTCMinutes())
    );
  }
};