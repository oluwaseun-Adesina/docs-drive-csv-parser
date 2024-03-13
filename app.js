const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

const front = "https://drive.google.com/file/d/";
const back = "/view?usp=drive_link";
const uploadPath = path.join(__dirname, 'uploads');
const input_file = 'attachment.csv';
const output_file = 'new_attachment.csv';

// Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadPath));

app.get('/', (req, res) => {
    // Render the upload form
    res.render('upload');
});

app.post('/process', upload.single('csvFile'), (req, res) => {
    const new_list = [];

    // Function to extract the ID from the URL
    function extractId(url) {
        const match = url.match(/id=([^&]+)/);
        return match ? match[1] : null;
    }

    const csvData = req.file.buffer.toString('utf-8');

    // Processing the CSV data
    csvData
        .split('\n')
        .forEach((row) => {
            const url = row.trim();
            const fileId = extractId(url);
            if (fileId) {
                const newValue = front + fileId + back;
                new_list.push(newValue);
            }
        });

    // Writing the new list to a new CSV file
    fs.writeFileSync(output_file, new_list.join('\n'));
    console.log("File written");

    // Render the view with the new list
    res.render('index', { new_list });
});

// Route to download the new_attachment.csv file
app.get('/download', (req, res) => {
    res.download(output_file, 'new_attachment.csv');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
