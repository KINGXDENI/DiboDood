const prisma = require("./db/prismaClient");
const axios = require('axios');
const cheerio = require('cheerio');
const getDood = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const videos = await prisma.video.findMany({
                include: {
                    channel: true, // Sertakan relasi Channel
                },
            });
            resolve(videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
            reject(new Error('Internal Server Error'));
        }
    });
};
const scrapeVideoData = async (url) => {
    try {
        const {
            data
        } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('#title').text().trim();
        const duration = $('body > main > section:nth-child(2) > div > div > div > p:nth-child(1)').text().trim();
        const postedAt = $('body > main > section:nth-child(2) > div > div > div > p:nth-child(3)').text().trim();
        const thumbnailURL = $('#wrapper > img').attr('data-src');
        const views = Math.floor(Math.random() * 1000000); // Generate random views
        const channelName = url.split('://')[1].split('/')[0]; // Extract channel name from URL
        const channelURL = url.split('://')[1].split('/d/')[0]; // Extract channel URL from URL
        const logo = $('head > link:nth-child(8)').attr('href');

        return {
            title,
            videoURL: url, // URL video itu sendiri
            thumbnailURL,
            duration,
            views,
            postedAt,
            channel: {
                name: channelName,
                url: channelURL,
                logo,
            },
            platform: 'dood', // Platform tetap 'dood'
        };
    } catch (error) {
        console.error('Error scraping video data:', error);
        throw new Error('Failed to scrape video data');
    }
};

// Fungsi untuk menambahkan video ke database menggunakan addDood
const addScrapedVideo = async (url) => {
    try {
        const videoData = await scrapeVideoData(url);
        const newVideo = await addDood(videoData);
        console.log('Video added successfully:', newVideo);
    } catch (error) {
        console.error('Error adding video:', error);
    }
};

// Fungsi addDood yang sudah ada
const addDood = (videoData) => {
    return new Promise(async (resolve, reject) => {
        const {
            title,
            videoURL, // Mengganti 'url' dengan 'videoURL'
            thumbnailURL, // Mengganti 'thumbnail' dengan 'thumbnailURL'
            duration,
            views,
            postedAt, // Mengganti 'uploaded' dengan 'postedAt'
            channel, // Channel harus memiliki objek dengan name, url, dan logo
            platform
        } = videoData;

        try {
            // Pertama, cari atau buat channel
            const channelRecord = await prisma.channel.upsert({
                where: {
                    url: channel.url,
                },
                update: {
                    logo: channel.logo,
                    name: channel.name,
                },
                create: {
                    name: channel.name,
                    logo: channel.logo,
                    url: channel.url,
                },
            });

            // Kemudian, buat video
            const newVideo = await prisma.video.create({
                data: {
                    title,
                    videoURL, // Gunakan videoURL
                    thumbnailURL, // Gunakan thumbnailURL
                    duration,
                    views,
                    postedAt: new Date(postedAt), // Gunakan postedAt
                    channel: {
                        connect: {
                            id: channelRecord.id
                        }, // Menghubungkan video dengan channel
                    },
                    platform,
                },
            });
            resolve(newVideo);
        } catch (error) {
            console.error('Error creating video:', error);
            reject(new Error('Internal Server Error'));
        }
    });
};


module.exports = {
    getDood,
    addDood,
    addScrapedVideo
}