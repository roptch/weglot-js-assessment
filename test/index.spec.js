const assert = require('assert');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const glob = require('glob');
const Solver = require('../src/Solver');

describe('nominal cases', () => {
  glob.sync(path.join(__dirname, '../data/input*.txt')).forEach(file => {
    const testNb = (((path.basename(file).split('.'))[0]).split('input'))[1];
    it('should match the solution of input' + testNb + ' with output' + testNb, async () => {
      const outputReader = readline.createInterface({ input: fs.createReadStream(path.join(__dirname, '../data/output' + testNb + '.txt')) });
      let output = null;
      for await (const line of outputReader) {
        // Ugly but calling the iterator manually is probably uglier
        output = line;
        break;
      }

      const solver = new Solver();
      const inputReader = readline.createInterface({ input: fs.createReadStream(file) });
      for await (const line of inputReader) {
        solver.addInput(line);
      }
      const solution = solver.resolve();

      assert.strictEqual(output, solution && solution.toString());
    });
  });
});