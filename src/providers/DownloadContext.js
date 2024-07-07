// DownloadContext.js
import React, { createContext, useState } from 'react';

const DownloadContext = createContext();

export const DownloadProvider = ({ children }) => {
    const [downloadUrls, setDownloadUrls] = useState([]);

    const addDownloadUrl = (url) => {
        setDownloadUrls((prevUrls) => [...prevUrls, url]);
    };

    return (
        <DownloadContext.Provider value={{ downloadUrls, addDownloadUrl }}>
            {children}
        </DownloadContext.Provider>
    );
};

export default DownloadContext;
