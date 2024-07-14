import React, { useState, useRef, useContext } from 'react';
import storage from '../config/firebase'; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import '../styles/UploadArea.css'; // Import the CSS file
import DownloadContext from '../providers/DownloadContext';
import { MdDriveFolderUpload } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import axios from 'axios';

const UploadArea = ({userId, assId}) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const dropAreaRef = useRef(null);
    const { addDownloadUrl } = useContext(DownloadContext);

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

    const handleUpload = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
        formData.append('userId', userId);
        formData.append('assId', assId);

        try {
            const response = await axios.post('/api/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            console.log(response.data);
            alert('Files uploaded successfully!');
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Failed to upload files');
        }
    };

    const removeFile = (fileName) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };

    return (
        <div className='upload-container'>
            <div className="upload-area">
                <div
                    className="drop-area"
                    ref={dropAreaRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <span>Drop files here or <a href="#" onClick={() => dropAreaRef.current.querySelector('input').click()}>Browse</a></span>
                    <input type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                </div>
                <button onClick={handleUpload} disabled={uploading}>{<MdDriveFolderUpload size={35}/>}</button>
            </div>
            
            {files.length > 0 && (
                <div className="upload-list-root">
                    <ul className="ul-element">
                        {files.map((file) => (
                            <li key={file.name} className="file-lists">
                                <span className="file-name">{file.name}</span>
                                {/* <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span> */}
                                <p className='uploading-text'>{uploading ? 'Uploading...' : ''}</p>
                                <span className="close-icon-container" onClick={() => removeFile(file.name)}><IoIosClose size={25}/></span>
                            </li>
                        ))}
                    </ul>
                    
                </div>
            )}
           
        </div>
    );
};

export default UploadArea;
