const prisma = require("./db/prismaClient");

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
            const [channelRecord] = await prisma.channel.upsert({
                where: {
                    name: channel.name,
                },
                update: {
                    logo: channel.logo,
                    url: channel.url,
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
    addDood
}