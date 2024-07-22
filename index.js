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
const {
    getDood,
    addScrapedVideo
} = require('./dood');

const app = express();
const port = 3100;
app.use(express.urlencoded({
    extended: true
}));
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
app.get('/admin', async (req, res) => {
    try {
        const videos = await prisma.video.findMany({
            include: {
                channel: true,
            },
        });
        res.render('admin-dood', {
            videos
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});
app.get('/videos/:id', async (req, res) => {
    const videoId = parseInt(req.params.id, 10);

    try {
        // Fetch the video by ID from the database, including related Channel details
        const video = await prisma.video.findUnique({
            where: {
                id: videoId
            },
            include: {
                channel: true // Include related channel data
            }
        });

        if (!video) {
            return res.status(404).json({
                message: 'Video not found'
            });
        }

        // Return the video details along with the related channel data
        res.json({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail,
            duration: video.duration,
            views: video.views,
            postedAt: video.postedAt,
            channel: {
                name: video.channel.name,
                logo: video.channel.logo,
                url: video.channel.url,
                // Add other channel details here if needed
            }
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});
app.delete('/videos/:id', async (req, res) => {
    const videoId = parseInt(req.params.id);

    try {
        // Menghapus video dari database menggunakan Prisma Client
        const result = await prisma.video.delete({
            where: {
                id: videoId,
            },
        });

        res.status(200).json({
            message: 'Video deleted successfully',
            result,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Failed to delete video',
        });
    }
});

app.post('/add-video', async (req, res) => {
    const {
        title,
        videoURL,
        thumbnailURL,
        duration,
        views,
        postedAt,
        channelName,
        channelUrl,
        logoURL,
        platform
    } = req.body;

    try {
        const [channelRecord] = await prisma.channel.upsert({
            where: {
                url: channelUrl,
            },
            update: {
                logo: logoURL,
                name: channelName,
            },
            create: {
                name: channelName,
                logo: logoURL,
                url: channelUrl,
            },
        });

        const newVideo = await prisma.video.create({
            data: {
                title,
                videoURL,
                thumbnailURL,
                duration,
                views,
                postedAt: new Date(postedAt),
                channel: {
                    connect: {
                        id: channelRecord.id
                    },
                },
                platform,
            },
        });

        res.redirect('/admin'); // Redirect to admin page after adding
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});
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