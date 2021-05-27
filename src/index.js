const readline = require('readline');
const config = require('./config');
const Solver = require('./Solver');

const solver = new Solver(config);

const stdin = readline.createInterface({ input: process.stdin });
stdin.on('line', line => {
  try {
    solver.addInput(line);
  } catch (e) {
    console.error('Failed to register input line:');
    console.error(e.message);
  }
});

stdin.on('close', () => {
  const solution = solver.resolve();
  if (solution) {
    console.log(solution.toString());
  } else {
    console.log('No solution found.');
  }
});