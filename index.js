const express = require('express');
const path = require('path');
const {
    xnxx,
    xnxxdown
} = require('./xnxx');
const {
    scrapeYouTube
} = require('./yt');
const prisma = require('./db/prismaClient');
const { getDood, addScrapedVideo } = require('./dood');

const app = express();
const port = 3100;
app.use(express.json());
// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Dummy data for demonstration
const categories = [{
        name: 'Youtube',
        url: '',
        active: true
    },
    {
        name: 'Xnxx',
        url: 'Xnxx',
        active: false
    },
    {
        name: 'Doods',
        url: 'Doods',
        active: false
    },
    // Add more categories as needed
];

// Function to update category active status
function updateActiveCategory(categories, activeCategory) {
    return categories.map(category => ({
        ...category,
        active: category.name === activeCategory
    }));
}
app.get('/xnxxdown', async (req, res) => {
    try {
        const url = req.query.url;
        const frame = await xnxxdown(url);
        const iframe = frame.iframeSrc
        res.json({
            iframe
        });
    } catch (error) {
        console.error('Error in xnxxdown route:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});
// Route to fetch and render videos from xnxx
app.get('/xnxx', async (req, res) => {
    try {
        const videos = await xnxx(); // Fetch videos using xnxx function
        const updatedCategories = updateActiveCategory(categories, 'Xnxx');
        res.render('index', {
            categories: updatedCategories,
            videos
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
app.post('/addvideo', async (req, res) => {
    const {
        url
    } = req.body;

    if (!url) {
        return res.status(400).json({
            error: 'URL is required'
        });
    }

    try {
        await addScrapedVideo(url);
        res.status(201).json({
            message: 'Video added successfully'
        });
    } catch (error) {
        console.error('Error adding scraped video:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});


app.get('/doods', async (req, res) => {
    try {
        const videos = await getDood(); // Fetch videos using xnxx function
        const updatedCategories = updateActiveCategory(categories, 'Doods');
        res.render('index', {
            categories: updatedCategories,
            videos
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
// Route to render the homepage
app.get('/', async (req, res) => {
    try {
        const searchQuery = 'programming tutorials'; // Default search query for scrapeYouTube
        const videos = await scrapeYouTube(searchQuery); // Fetch videos using scrapeYouTube function
        const updatedCategories = updateActiveCategory(categories, 'Youtube');
        res.render('index', {
            categories: updatedCategories,
            videos
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});