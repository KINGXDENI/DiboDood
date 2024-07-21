const express = require('express');
const path = require('path');
const {
    xnxx
} = require('./xnxx');
const {
    scrapeYouTube
} = require('./yt');
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
        res.render('index', {
            categories,
            videos
        });
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
});

// Route to render the homepage
app.get('/', async (req, res) => {
    try {
        const searchQuery = 'programming tutorials'; // Query default untuk scrapeYouTube
        const videos = await scrapeYouTube(searchQuery); // Fetch videos using getVideos function
        res.render('index', {
            categories,
            videos
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});