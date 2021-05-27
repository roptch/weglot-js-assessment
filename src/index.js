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
let lineNb = 1;
stdin.on('line', line => {
  try {
    // Input syntax checks and parsing
    const lineSplit = line.split(' ');
    if (lineSplit.length !== 2) {
      throw new Error('Parse error: malformed input (line ' + lineNb + ')');
    }
    const day = String(lineSplit[0]);
    if (!(day in inputsByDay)) {
      throw new Error('Ignoring input at line ' + lineNb + ' because the day "' + day + '" is not allowed');
    }
    const range = lineSplit[1].split('-');
    if (range.length !== 2) {
      throw new Error('Parse error: malformed input (line ' + lineNb + ')');
    }

    const insertInput = input => {
      // Loop through all time ranges and check if there are any collisions between them.
      // Merge them if this is the case
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
          // Collision at the end (or inside) of the longest time range detected

          // Create a new range that is a merge of the two
          const newInput = {
            start: longestInput.start,
            end: new Date(Math.max(shortestInput.end.getTime(), longestInput.end.getTime()))
          };

          // Delete the former range from the list as it is now merged
          inputsByDay[day].splice(index, 1);

          // Recursive call to check if we can merge again other ranges into the new one
          return insertInput(newInput);
        } else if (shortestInput.end >= longestInput.start && shortestInput.end <= longestInput.end) {
          // Collision at the start of the longest time range detected

          // Create a new range that is a merge of the two
          const newInput = {
            start: new Date(Math.max(shortestInput.start.getTime(), longestInput.start.getTime())),
            end: longestInput.end
          };

          // Delete the former range from the list as it is now merged
          inputsByDay[day].splice(index, 1);

          // Recursive call to check if we can merge again other ranges into the new one
          return insertInput(newInput);
        }
      }

      // No collision found anymore, ready to insert the element at the right position
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

    const start = utils.strTimeToDate(range[0]);
    if (start === null) {
      throw new Error('Parse error: could not determine hours/minutes from the string "' + range[0] + '" at line ' + lineNb);
    }
    
    const end = utils.strTimeToDate(range[1]);
    if (end === null) {
      throw new Error('Parse error: could not determine hours/minutes from the string "' + range[1] + '" at line ' + lineNb);
    }

    insertInput({
      start,
      end
    });
  } catch (e) {
    console.error('Failed to register input line:');
    console.error(e.message);
  }

  ++lineNb;
});

// Resolution
stdin.on('close', () => {
  const
    minTime = utils.strTimeToDate(config.minTime),
    minTimeRangeEnd = new Date(minTime.getTime() + (59 * 60 * 1000)),
    maxTime = utils.strTimeToDate(config.maxTime),
    maxTimeRangeStart = new Date(maxTime.getTime() - (59 * 60 * 1000));

  let solution = null;
  for (const day in inputsByDay) {
    if (inputsByDay[day].length === 0) {
      // No input this day, the solution is the minTime
      solution = {
        day,
        start: minTime,
        end: minTimeRangeEnd
      };
    } else {
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
        if (index == inputsByDay[day].length - 1 && input.end < maxTimeRangeStart) {
          solution = {
            day,
            start: new Date(input.end.getTime() + (1 * 60 * 1000)), // Solution starts 1 minute after the ending of the previous time range
            end: new Date(input.end.getTime() + (60 * 60 * 1000))
          };
          break;
        }
      }
    }

    if (solution) {
      // First solution found, print and exit
      return console.log(
        solution.day
        + ' ' + utils.withLeadingZero(solution.start.getUTCHours()) + ':' + utils.withLeadingZero(solution.start.getUTCMinutes())
        + '-' + utils.withLeadingZero(solution.end.getUTCHours()) + ':' + utils.withLeadingZero(solution.end.getUTCMinutes())
      );
    }
  }
});