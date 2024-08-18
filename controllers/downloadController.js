const { bucket } = require('../utils/firebase');
const path = require('path');
const fs = require('fs');
const os = require('os');
const archiver = require('archiver');

const downloadFile = async (req, res) => {
    const { sid, aid } = req.query;
    const folderName = `st${sid}-as${aid}`;
    const tempFilePath = path.join(os.tmpdir(), `${folderName}.zip`);

    try {
        const files = await bucket.getFiles({ prefix: folderName });
        const output = fs.createWriteStream(tempFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            res.download(tempFilePath, `${folderName}.zip`, (err) => {
                if (err) {
                    console.error('Error in downloading the file:', err);
                }
                fs.unlinkSync(tempFilePath); // Clean up the temp file
            });
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);

        files[0].forEach(file => {
            const fileStream = bucket.file(file.name).createReadStream();
            archive.append(fileStream, { name: path.basename(file.name) });
        });

        await archive.finalize();
    } catch (error) {
        console.error('Error in zipping the folder:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { downloadFile };