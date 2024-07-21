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
        name: 'Youtube',
        active: true
    },
    {
        name: 'Xnxx',
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
