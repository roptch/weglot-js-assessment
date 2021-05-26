module.exports = {
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

  withLeadingZero: number => {
    return ('0' + number).slice(-2);
  }
};