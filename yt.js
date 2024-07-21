const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');

// Fungsi untuk scrape video dari YouTube menggunakan yt-search
async function scrapeYouTube(query) {
    try {
        const results = await ytSearch(query);
        const videos = results.videos; // Ambil 10 video teratas

        const videoDetails = videos.map((video, index) => ({
            id: (index + 1).toString(), // Menambahkan ID sebagai string
            videoId: video.videoId,
            title: video.title,
            channel: {
                name: video.author.name,
                url: `${video.author.url}`, // URL channel yang sesuai
                logo: 'https://www.youtube.com/s/desktop/060ac52e/img/favicon_144x144.png' // Logo default
            },
            views: video.views,
            postedAt: video.ago,
            duration: video.timestamp, // Durasi dalam format 'm:ss'
            thumbnailURL: video.thumbnail,
            videoURL: video.url
        }));

        return videoDetails;
    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        throw error;
    }
}

// Fungsi untuk mendapatkan metadata video menggunakan ytdl-core
async function getVideoMetadata(videoId) {
    try {
        const info = await ytdl.getInfo(videoId);
        const videoDetails = {
            title: info.videoDetails.title,
            duration: formatDuration(info.videoDetails.lengthSeconds),
            views: info.videoDetails.viewCount,
            description: info.videoDetails.description,
            thumbnail: info.videoDetails.thumbnails[0].url
        };

        return videoDetails;
    } catch (error) {
        console.error('Error fetching video metadata:', error);
        throw error;
    }
}

// Fungsi untuk format durasi dalam format 'm:ss'
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

module.exports = {
    scrapeYouTube,
    getVideoMetadata
}