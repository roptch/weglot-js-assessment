module.exports = {
  /**
   * Converts a time hh:mm to a Date object
   * 
   * @param {String} strTime 
   * 
   * @returns {Date}
   */
  strTimeToDate: strTime => {
    const strTimeSplit = strTime.split(':');
    if (strTimeSplit.length !== 2) {
      // Error
      return null;
    }

    const hours = Number(strTimeSplit[0]);
    if (Number.isNaN(hours)) {
      // Error
      return null;
    }
    if (hours < 0 || hours > 23) {
      // Error
      return null;
    }

    const minutes = Number(strTimeSplit[1]);
    if (Number.isNaN(minutes)) {
      // Error
      return null;
    }
    if (minutes < 0 || minutes > 59) {
      // Error
      return null;
    }

    const ret = new Date();
    ret.setUTCHours(hours);
    ret.setUTCMinutes(minutes);

    return ret;
  },

  /**
   * Adds a leading zero before the number if it is only one digit
   * 
   * @param {Number} number 
   * 
   * @returns {String} 
   */
  withLeadingZero: number => {
    return ('0' + number).slice(-2);
  }
};