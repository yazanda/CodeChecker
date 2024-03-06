import '../styles/Home.css';
import React, {useState} from 'react';
import { Button } from 'react-bootstrap';
import { FaUpload } from 'react-icons/fa';
import Header from '../components/header';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import storage from '../backend/config/firebase'

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
            // Upload file to Firebase Storage
            const storageRef = ref(storage, file.name);
            await uploadBytes(storageRef, file);

            // Get download URL for the uploaded file
            const downloadURL = await getDownloadURL(ref(storage, file.name));

            console.log('File uploaded successfully:', downloadURL);

            // Perform compilation (replace this with your compilation logic)
            console.log('Compiling file...');

            // Reset file state
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