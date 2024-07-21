const express = require('express');
const path = require('path');
const xnxx = require('./xnxx');
const app = express();
const port = 3100;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Dummy data for demonstration
const categories = [{
        name: 'All',
        active: true
    },
    {
        name: 'Website',
        active: false
    },
    // Add more categories as needed
];
app.get('/xnxx', async (req, res) => {
    try {
        const videos = await xnxx(); // Fetch videos using xnxx function
        res.json(videos); // Send data as JSON
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching videos'
        });
    }
});

// Route to render the homepage
app.get('/', async (req, res) => {
    try {
        const videos = await xnxx(); // Fetch videos using getVideos function
        console.log(videos);
        res.render('index', {
            categories,
            videos
        });
    } catch (error) {
        res.status(500).send('Error fetching videos');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
