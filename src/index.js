const readline = require('readline');
const config = require('./config');
const utils = require('./utils');

const stdin = readline.createInterface({ input: process.stdin });

// Initialize inputs storage
const inputsByDay = {};
for (const day of config.days) {
  inputsByDay[String(day)] = [];
}

// Store each line
stdin.on('line', line => {
  const lineSplit = line.split(' ');
  if (lineSplit.length !== 2) {
    // Error
    return;
  }

  const day = String(lineSplit[0]);
  if (!(day in inputsByDay)) {
    // Error
    return;
  }

  const range = lineSplit[1].split('-');
  if (range.length !== 2) {
    // Error
    return;
  }

  const insertInput = input => {
    // Loop through all time ranges and check if there are any collisions. Merge ranges recursively if this is the case
    for (const index in inputsByDay[day]) {
      const currentInput = inputsByDay[day][index];

      // Determine the longest time range to merge the other into
      let longestInput = currentInput;
      let shortestInput = input;
      if (shortestInput.end.getTime() - shortestInput.start.getTime() > longestInput.end.getTime() - longestInput.start.getTime()) {
        longestInput = input;
        shortestInput = currentInput;
      }

      if (shortestInput.start >= longestInput.start && shortestInput.start <= longestInput.end) {
        const newInput = {
          start: longestInput.start,
          end: new Date(Math.max(shortestInput.end.getTime(), longestInput.end.getTime()))
        };
        inputsByDay[day].splice(index, 1);
        return insertInput(newInput);
      } else if (shortestInput.end >= longestInput.start && shortestInput.end <= longestInput.end) {
        const newInput = {
          start: new Date(Math.max(shortestInput.start.getTime(), longestInput.start.getTime())),
          end: longestInput.end
        };
        inputsByDay[day].splice(index, 1);
        return insertInput(newInput);
      }
    }

    // No collision found, ready to insert the element at the right position
    let inserted = false;
    for (const index in inputsByDay[day]) {
      const currentInput = inputsByDay[day][index];

      if (input.start < currentInput.start) {
        inputsByDay[day].splice(index, 0, input);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      inputsByDay[day].push(input);
    }
  };

  insertInput({
    start: utils.strTimeToDate(range[0]),
    end: utils.strTimeToDate(range[1])
  });
});

// Resolution
stdin.on('close', () => {
  const minTime = utils.strTimeToDate(config.minTime);
  const minTimeRangeEnd = new Date(minTime.getTime() + (59 * 60 * 1000));
  const maxTime = utils.strTimeToDate(config.maxTime);
  const maxTimeRangeStart = new Date(maxTime.getTime() - (59 * 60 * 1000));

  let solution = null;
  for (const day in inputsByDay) {
    let maxEnd = null;

    for (const index in inputsByDay[day]) {
      const input = inputsByDay[day][index];

      // Checks if there is availability before the first time range of the day
      if (index == 0 && minTimeRangeEnd < input.start) {
        solution = {
          day,
          start: minTime,
          end: minTimeRangeEnd
        };
        break;
      }

      // Checks if there is availability between 2 time ranges
      if (index > 0) {
        const prevInput = inputsByDay[day][index - 1];
        if (prevInput.end.getTime() + (60 * 60 * 1000) < input.start.getTime()) {
          solution = {
            day,
            start: new Date(prevInput.end.getTime() + (1 * 60 * 1000)), // Solution starts 1 minute after the ending of the previous time range
            end: new Date(prevInput.end.getTime() + (60 * 60 * 1000))
          };
          break;
        }
      }

      // Checks if there is availability after the last time range of the day
      maxEnd = maxEnd && maxEnd > input.end ? maxEnd : input.end;
      if (index == inputsByDay[day].length - 1 && input.end < maxTimeRangeStart) {
        solution = {
          day,
          start: new Date(input.end.getTime() + (1 * 60 * 1000)),
          end: new Date(input.end.getTime() + (60 * 60 * 1000))
        };
        break;
      }
    }

    if (solution) {
      break;
    }
  }

  if (solution) {
    console.log(solution.day + ' ' + utils.withLeadingZero(solution.start.getUTCHours()) + ':' + utils.withLeadingZero(solution.start.getUTCMinutes())
      + '-' + utils.withLeadingZero(solution.end.getUTCHours()) + ':' + utils.withLeadingZero(solution.end.getUTCMinutes()));
  }
});