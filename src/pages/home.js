import '../styles/Home.css';
import React, {useState} from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { FaUpload } from 'react-icons/fa';
// import Header from '../components/header';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import storage from '../config/firebase'

function Home() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [compiling, setCompiling] = useState(false);
    const [compileOutput, setCompileOutput] = useState('');
    const [isCompiled, setIsCompiled] = useState(false);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);
            setFileName(file.name); // Update the filename state
        } else {
            setFileName(''); // Reset the filename if no file is selected
        }
    };

    const handleFileUpload = async () => {
        if (!file) {
            console.log('No file selected.');
            return;
        }

        setUploading(true);

        try {
            
            const storageRef = ref(storage, file.name);
            await uploadBytes(storageRef, file);

            const downloadURL = await getDownloadURL(ref(storage, file.name));

            const response = await fetch(downloadURL);
            const fileContent = await response.text();

            console.log('File uploaded successfully:', downloadURL);

            console.log(fileContent);

            console.log('Compiling file...');

            sendFileContentToBackend(fileContent);

            setFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
        }

        setUploading(false);
    };

    const sendFileContentToBackend = async (fileContent) => {
        setCompiling(true);
        const backendUrl = '/compile';
        try {
            const response = await axios.post(backendUrl, {
                lang: 'python', 
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
    

    return (
        <div className="container">
            <div className="sidebar">
                <h4>Compile</h4>
            </div>
            <div className="content">
                <div className="header">
                    <div className="logo">Code Compiler</div>
                </div>
                <div className="upload-area">
                    <h2>Upload Your Code File</h2>
                    <div className="file-upload-container">
                        <input type="file" id="file" className="file-input" onChange={handleFileChange} />
                        <label htmlFor="file" className="file-input-label"><FaUpload /> Choose a file</label>
                        {fileName && <div className="file-name">{fileName}</div>}
                    </div>
                    <Button variant="primary" className="button" onClick={handleFileUpload} disabled={!file || uploading}>
                        {uploading ? 'Uploading...' : <><FaUpload /> Upload File</>}
                    </Button>
                    {compiling && <div>Compiling...</div>}
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
    

};

export default Home;