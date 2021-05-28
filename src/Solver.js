const utils = require('./utils');
const DayTimeRange = require('./DayTimeRange');

module.exports = class Solver {
  /**
   * Constructor
   * 
   * @param {Object} config 
   * @param {Array.<Number>} config.days List of allowed days
   * @param {String} config.minTime Start time of a day
   * @param {String} config.maxTime End time of a day
   */
  constructor(config = {}) {
    this._days = config.days || [1, 2, 3, 4, 5];
    this._minTime = utils.strTimeToDate(config.minTime || '08:00');
    this._maxTime = utils.strTimeToDate(config.maxTime || '08:00');
    this._inputNb = 0;

    // Initialize storage
    this._timeRangesByDay = {};
    for (const day of this._days) {
      this._timeRangesByDay[String(day)] = [];
    }
  }

  /**
   * Loop through all time ranges and check if there are any collisions between them.
   * Merge them if this is the case
   * Finally adds the time range into the storage
   * 
   * @param {DayTimeRange} timeRange 
   */
  _storeTimeRange(timeRange) {
    for (const index in this._timeRangesByDay[timeRange.day]) {
      const currentTimeRange = this._timeRangesByDay[timeRange.day][index];

      // Determine the longest time range to merge the other into
      let longestTimeRange = currentTimeRange;
      let shortestTimeRange = timeRange;
      if (shortestTimeRange.end.getTime() - shortestTimeRange.start.getTime() > longestTimeRange.end.getTime() - longestTimeRange.start.getTime()) {
        longestTimeRange = timeRange;
        shortestTimeRange = currentTimeRange;
      }

      if (shortestTimeRange.start >= longestTimeRange.start && shortestTimeRange.start <= longestTimeRange.end) {
        // Collision at the end (or inside) of the longest time range detected

        // Create a new range that is a merge of the two
        const newTimeRange = new DayTimeRange(timeRange.day, longestTimeRange.start, new Date(Math.max(shortestTimeRange.end.getTime(), longestTimeRange.end.getTime())));

        // Delete the former range from the list as it is now merged
        this._timeRangesByDay[timeRange.day].splice(index, 1);

        // Recursive call to check if we can merge again other ranges into the new one
        return this._storeTimeRange(newTimeRange);
      } else if (shortestTimeRange.end >= longestTimeRange.start && shortestTimeRange.end <= longestTimeRange.end) {
        // Collision at the start of the longest time range detected

        // Create a new range that is a merge of the two
        const newTimeRange = new DayTimeRange(timeRange.day, new Date(Math.max(shortestTimeRange.start.getTime(), longestTimeRange.start.getTime())), longestTimeRange.end);

        // Delete the former range from the list as it is now merged
        this._timeRangesByDay[timeRange.day].splice(index, 1);

        // Recursive call to check if we can merge again other ranges into the new one
        return this._storeTimeRange(newTimeRange);
      }
    }

    // No collision found anymore, ready to insert the element at the right position
    let inserted = false;
    for (const index in this._timeRangesByDay[timeRange.day]) {
      const currentTimeRange = this._timeRangesByDay[timeRange.day][index];

      if (timeRange.start < currentTimeRange.start) {
        this._timeRangesByDay[timeRange.day].splice(index, 0, timeRange);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this._timeRangesByDay[timeRange.day].push(timeRange);
    }
  }

  /**
   * Parses inputs and store them
   * 
   * @param {String} input Raw input to parse
   */
  addInput(input) {
    // Input syntax checks and parsing
    const inputSplit = input.split(' ');
    if (inputSplit.length !== 2) {
      throw new Error('Parse error: malformed input (line ' + (this._inputNb + 1) + ')');
    }
    const day = String(inputSplit[0]);
    if (!(day in this._timeRangesByDay)) {
      throw new Error('Ignoring input at line ' + (this._inputNb + 1) + ' because the day "' + day + '" is not allowed');
    }
    const range = inputSplit[1].split('-');
    if (range.length !== 2) {
      throw new Error('Parse error: malformed input (line ' + (this._inputNb + 1) + ')');
    }

    const start = utils.strTimeToDate(range[0]);
    if (start === null) {
      throw new Error('Parse error: could not determine hours/minutes from the string "' + range[0] + '" at line ' + (this._inputNb + 1));
    }
    
    const end = utils.strTimeToDate(range[1]);
    if (end === null) {
      throw new Error('Parse error: could not determine hours/minutes from the string "' + range[1] + '" at line ' + (this._inputNb + 1));
    }

    const dayTimeRange = new DayTimeRange(day, start, end);
    this._storeTimeRange(dayTimeRange);
  }

  /**
   * Find the earliest time range in which we can organise a meeting
   * taking into account all the user inputs
   * 
   * @returns {DayTimeRange} solution
   */
  resolve() {
    const
      minTimeRangeEnd = new Date(this._minTime.getTime() + (59 * 60 * 1000)),
      maxTimeRangeStart = new Date(this._maxTime.getTime() - (59 * 60 * 1000));

    let solution = null;
    for (const day in this._timeRangesByDay) {
      if (this._timeRangesByDay[day].length === 0) {
        // No input this day, the solution is the minTime
        solution = new DayTimeRange(day, this._minTime, minTimeRangeEnd);
      } else {
        for (const index in this._timeRangesByDay[day]) {
          const timeRange = this._timeRangesByDay[day][index];

          // Checks if there is availability before the first time range of the day
          if (index == 0 && minTimeRangeEnd < timeRange.start) {
            solution = new DayTimeRange(day, this._minTime, minTimeRangeEnd);
            break;
          }

          // Checks if there is availability between 2 time ranges
          if (index > 0) {
            const prevTimeRange = this._timeRangesByDay[day][index - 1];
            if (prevTimeRange.end.getTime() + (60 * 60 * 1000) < timeRange.start.getTime()) {
              solution = new DayTimeRange(
                day,
                new Date(prevTimeRange.end.getTime() + (1 * 60 * 1000)), // Solution starts 1 minute after the ending of the previous time range
                new Date(prevTimeRange.end.getTime() + (60 * 60 * 1000))
              );
              break;
            }
          }

          // Checks if there is availability after the last time range of the day
          if (index == this._timeRangesByDay[day].length - 1 && timeRange.end < maxTimeRangeStart) {
            solution = new DayTimeRange(
              day,
              new Date(timeRange.end.getTime() + (1 * 60 * 1000)), // Solution starts 1 minute after the ending of the previous time range
              new Date(timeRange.end.getTime() + (60 * 60 * 1000))
            );
            break;
          }
        }
      }

      if (solution) {
        // First solution found
        return solution;
      }
    }

    return solution;
  }
};