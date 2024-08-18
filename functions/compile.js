const fs = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

/**
 * Compiles and runs the provided code in the specified language.
 * @param {string} lang - The programming language of the code.
 * @param {string} code - The code to compile and run.
 * @param {function} callback - The callback function to call with the result.
 */
const compileAndRun = (lang, code, callback) => {
  const filename = `${uuidv4()}.${lang === 'python' ? 'py' : lang === 'java' ? 'java' : lang === 'c' ? 'c' : lang === 'cpp' ? 'cpp' : 'unknown'}`;
  
  fs.writeFile(filename, code, (err) => {
    if (err) {
      callback('Error writing file on the server.', null);
      return;
    }

    // Set file permissions (chmod) for execution
    fs.chmod(filename, 0o755, (err) => {
      if (err) {
        callback('Error setting file permissions.', null);
        return;
      }

      // Determine the execution command based on the language
      let execCmd;
      if (lang === 'python') {
        execCmd = `wsl -d Ubuntu python3 ${filename}`;
      } else if (lang === 'java') {
        execCmd = `wsl -d Ubuntu javac ${filename} && wsl -d Ubuntu java ${filename.replace('.java', '')}`;
      } else if (lang === 'c') {
        execCmd = `wsl -d Ubuntu gcc ${filename} -o ${filename.replace('.c', '')} && wsl -d Ubuntu ./${filename.replace('.c', '')}`;
      } else if (lang === 'cpp') {
        execCmd = `wsl -d Ubuntu g++ ${filename} -o ${filename.replace('.cpp', '')} && wsl -d Ubuntu ./${filename.replace('.cpp', '')}`;
      } else {
        callback('Unsupported language.', null);
        return;
      }

      console.log(`Executing command: ${execCmd}`);
      exec(execCmd, (error, stdout, stderr) => {
        // Clean up by deleting the temporary file
        fs.unlink(filename, (err) => { if (err) console.error('Error deleting file:', err); });

        if (error) {
          console.error('Execution error:', error);
          console.error('Stderr:', stderr);
          callback(stderr || error.message, null);
          return;
        }

        console.log('Stdout:', stdout);
        callback(null, stdout);
      });
    });
  });
};

module.exports = {
  compileAndRun,
};
