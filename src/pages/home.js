import '../styles/Home.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { FaUpload } from 'react-icons/fa';
import { db } from '../config/firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import storage from '../config/firebase';

function Home() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [compiling, setCompiling] = useState(false);
    const [compileOutput, setCompileOutput] = useState('');
    const [isCompiled, setIsCompiled] = useState(false);
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [tests, setTests] = useState([]);

    useEffect(() => {
        fetchExercises();

        const fetchedTests = [
            { id: 1, name: 'Test 1' },
            { id: 2, name: 'Test 2' },
            { id: 3, name: 'Test 3' },
            // Add more test objects as needed
        ];
        setTests(fetchedTests);
    }, []);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);
            setFileName(file.name); // Update the filename state
        } else {
            setFileName(''); // Reset the filename if no file is selected
        }

        setUploading(true);

        try {
            const storageRef = ref(storage, file.name);
            await uploadBytes(storageRef, file);
        } catch (error) {
            console.error('Error uploading file:', error);
        }

        setUploading(false);
    };

    const handleFileCompile = async () => {
        setCompiling(true);
        const backendUrl = '/compile';
        var fileContent = '';
        try {
            const downloadURL = await getDownloadURL(ref(storage, file.name));

            const response = await fetch(downloadURL);
            fileContent = await response.text();
            console.log(fileContent);
            setFile(null);
        } catch (error) {
            console.error('Error fetching file content:', error);
        }

        try {
            const response = await axios.post(backendUrl, {
                lang: selectedExercise.language.toLowerCase(),
                code: fileContent,
            });
            console.log('Compilation response:', response.data);
            setIsCompiled(response.data.compiled)
            setCompileOutput(response.data.output); // Adjust based on your actual response structure
            setCompiling(false);
            console.log(compileOutput);
        } catch (error) {
            console.error('Error sending file content to backend:', error);
            setCompileOutput('Error during compilation.');
            setCompiling(false);
        }
    };

    const fetchExercises = async () => {
        const querySnapshot = await getDocs(collection(db, "exercises"));
        setExercises(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleHomeworkClick = (homework) => {
        setSelectedExercise(homework);
    };

    return (
        <div className="container">
            <div className="sidebar">
                <h2>Hi Yazan :)</h2>
                <h4>Assignments</h4>
                <ul>
                    {exercises.map((homework) => (
                        <li key={homework.id} onClick={() => handleHomeworkClick(homework)}>
                            {homework.courseName}: {homework.assignmentName}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='tests-bar'>
                <h4>Tests</h4>
                <div className='test'>
                    {tests.map((test) => (
                            <label key={test.id} className="test-label">
                                <input type="checkbox" className="test-checkbox" />
                                {test.name}
                            </label>
                        ))}
                </div>
                <button>Run</button>
            </div>
            <div className="content">
                <div className="header">
                    <div className="logo">Code Checker</div>
                    {selectedExercise && (
                        <div className="homework-info">
                            <span>{selectedExercise.assignmentName}</span>
                            <span>{selectedExercise.codeLanguage}</span>
                        </div>
                    )}
                </div>
                <div className="upload-area">
                    <div className="file-upload-container">
                        <input type="file" id="file" className="file-input" onChange={handleFileChange} />
                        <label htmlFor="file" className="file-input-label"><FaUpload /> {uploading ? 'Uploading...' : 'Choose a file'}</label>
                        {fileName && <div className="file-name">{fileName}</div>}
                    </div>
                    <Button variant="primary" className="button" onClick={handleFileCompile} disabled={!file || !selectedExercise}>
                        {compiling ? 'Compiling...' : 'Compile'}
                    </Button>
                </div>
                {compileOutput && (
                    <div className="compile-output">
                        <div className="compilation-status">
                            {isCompiled ? (
                                <span className="success">Compiled Successfully</span>
                            ) : (
                                <span className="error">Compilation Failed</span>
                            )}
                        </div>
                        <div className="compilation-output">
                            <h3>Compilation Output:</h3>
                            <pre>{compileOutput}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
