const { db, bucket } = require('../utils/firebase');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const execute = async(req, res) => {
  const { assignmentId, studentId } = req.body;
  try {
    const assignment = await getAssignment(assignmentId);

    const fileExtension = assignment.lang.toLowerCase();
    const filePath = `st${studentId}-as${assignmentId}/main.${fileExtension}`;
    const fileName = `st${studentId}-as${assignmentId}.${fileExtension}`;
    const originFilePath = path.join(__dirname, fileName);
    console.log(originFilePath);

    await downloadFile(filePath, originFilePath);
    
    const results = await generateTests(fileName, originFilePath, assignment.tests, assignment.lang.toLowerCase());
    console.log(results);
    res.status(200).json(results);
    
  } catch (error) {
      res.status(500).json({ error: error.message });
      console.log(error);
  }
  

}

const appendMainFunctionToTempFile = async (mainFilePath, mainContent, tempFilePath) => {
  try {
    const existingContent = await fs.readFile(mainFilePath, 'utf8');
    // const combinedContent = `${existingContent}\n${mainContent}`;
    const formattedMainContent = mainContent.replace(/\\\\n/g, '\n').replace(/\\\"/g, '"');
    const combinedContent = `${existingContent}\n${formattedMainContent}`;
    await fs.writeFile(tempFilePath, combinedContent, 'utf8');
    console.log(`Combined content written to ${tempFilePath}`);
    return tempFilePath;
  } catch (error) {
    console.error(`Error writing combined content to temp file: ${error.message}`);
    throw new Error(error);
  }
};

const downloadFile = async (filePath, dest) => {
  const options = {
    destination: dest,
  };

  await bucket.file(filePath).download(options);
  console.log(`Downloaded ${filePath} to ${dest}`);
};

const getAssignment = async (id) => {
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('Invalid assignment ID');
  }

  try {
    const assignmentDoc = await db.collection('assignments').doc(id).get();
    if (!assignmentDoc.exists) {
      throw new Error('Assignment not found');
    }
    return assignmentDoc.data();
  } catch (error) {
    throw new Error('Error retrieving assignment: ' + error.message);
  }
}; 

const convertToWslPath = (windowsPath) => {
  const driveLetter = windowsPath[0].toLowerCase();
  const pathWithoutDrive = windowsPath.slice(2).replace(/\\/g, '/');
  return `/mnt/${driveLetter}${pathWithoutDrive}`;
};

const generateTests = async (fileName, mainFilePath, tests, language) => { 
  const tempFileName = language === 'java' ? 'Main.java' : `temp_${fileName}`;; 
  const tempFilePath = path.join(__dirname, `${tempFileName}`);
  const results = [];
 
  for (const test of tests) {
    const tempFilePathWithMain = await appendMainFunctionToTempFile(mainFilePath, test.main, tempFilePath);

    // Convert temp file path to WSL path
    const wslTempFilePath = convertToWslPath(tempFilePathWithMain);
    const wslOutputPath = wslTempFilePath.replace(path.extname(wslTempFilePath), '');
    console.log(wslTempFilePath);
    console.log(wslOutputPath);
    const wslDir = path.dirname(wslTempFilePath);

    // Determine the execution command based on the language
    let execCmd;
    if (language === 'py') {
      execCmd = `wsl -d Ubuntu bash -c "cd $(dirname '${wslTempFilePath}') && python3 '${wslTempFilePath}'"`;
    } else if (language === 'java') {
      execCmd = `wsl -d Ubuntu bash -c "cd $(dirname '${wslTempFilePath}') && javac Main.java && java Main"`;
    } else if (language === 'c' || language === 'cpp') {
      const compileCmd = language === 'c' ? 
        `gcc '${wslTempFilePath}' -o '${wslOutputPath}'` : 
        `g++ '${wslTempFilePath}' -o '${wslOutputPath}'`;

      const runCmd = test.valgrind ?
        `valgrind --leak-check=full ./${path.basename(wslOutputPath)}` :
        `'./${path.basename(wslOutputPath)}'`;

      execCmd = `wsl -d Ubuntu bash -c "cd $(dirname '${wslTempFilePath}') && ${compileCmd} && ${runCmd}"`;
    } else {
      results.push({ name: test.name, error: 'Unsupported language' });
      continue;
    }

    console.log(`Executing command: ${execCmd}`);

    try {
      const { stdout, stderr } = await execPromise(execCmd);
      if (stderr) {
        results.push({ name: test.name, error: stderr, status: 'failed' });
      } else {

        results.push({ name: test.name, output: stdout, status: stdout === test.expected.replace(/\\n/g, '\n')? 'Passed' : 'Failed' });
      }
      
    } catch (error) {
      results.push({ name: test.name, error: error.message });
    } 
  }

  return results;
};
 

const execPromise = (cmd) => {
  return new Promise((resolve, reject) => { 
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

// const convertToWslPath = (windowsPath) => {
//   const wslPath = execSync(`wsl wslpath "${windowsPath}"`).toString().trim();
//   return wslPath;
// };

// const mainFilePath = path.join(__dirname, 'main.c');
// const tests = [
//   {
//     stdin: 'input1\n',
//     expected: 'output1\n',
//     grade: '',
//     name: 'Test 1',
//     main: `
// #include <stdio.h>
// int main() {
//     printf("output1\\n"); 
//     return 0;
// }`
//   },
//   {
//     stdin: 'input2\n',
//     expected: 'output2\n',
//     grade: '',
//     name: 'Test 2',
//     main: `
// #include <stdio.h>
// int main() {
//     printf("output2\\n");
//     return 0;
// }`
//   }
// ];

// generateTests('main.c',mainFilePath, tests, 'c')
//   .then(results => console.log(results))
//   .catch(error => console.error(error));


module.exports = { execute };