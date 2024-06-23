import React, { useState, useRef } from 'react';
import storage from '../config/firebase'; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import '../styles/UploadArea.css'; // Import the CSS file

const UploadArea = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const dropAreaRef = useRef(null);

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const uploadFile = async (file) => {
        const storageRef = ref(storage, `uploads/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                console.error('Upload failed', error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('File available at', downloadURL);
            }
        );
    };

    const handleUpload = async () => {
        setUploading(true);
        for (const file of files) {
            await uploadFile(file);
        }
        setUploading(false);
        setFiles([]);
    };

    const removeFile = (fileName) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };

    return (
        <div>
            <div
                className="drop-area"
                ref={dropAreaRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <span>Drop files here or <a href="#" onClick={() => dropAreaRef.current.querySelector('input').click()}>Browse</a></span>
                <input type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
            </div>
            {files.length > 0 && (
                <div className="upload-list-root">
                    <ul className="ul-element">
                        {files.map((file) => (
                            <li key={file.name} className="file-lists">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span className="close-icon-container" onClick={() => removeFile(file.name)}>🗑️</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
                </div>
            )}
        </div>
    );
};

export default UploadArea;
