import '../styles/Home.css';
import React, {useState} from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { FaUpload } from 'react-icons/fa';
import Header from '../components/header';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import storage from '../config/firebase'

function Home() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
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

            // const response = await fetch(downloadURL);
            // const fileContent = await response.text();

            console.log('File uploaded successfully:', downloadURL);

            // console.log(fileContent);

            console.log('Compiling file...');

            setFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
        }

        setUploading(false);
    };

    return (
        <div className="container">
            <Header />
            <div className="content">
                <h2>Upload Your Code File</h2>
                <input type="file" onChange={handleFileChange} />
                <Button variant="primary" onClick={handleFileUpload} disabled={!file || uploading}>
                    {uploading ? 'Uploading...' : <><FaUpload /> Upload File</>}
                </Button>
            </div>
        </div>
    );

};

export default Home;