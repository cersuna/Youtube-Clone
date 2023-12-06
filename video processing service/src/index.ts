import express from "express";
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo} from "./storage";

setupDirectories();

const app = express();
app.use(express.json());

// invoke this through a cloud pub/sub message queue
app.post("/process-video", async (req, res) => {
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name){
            throw new Error('Invalid message payload received.')
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send('Bad Request: Missing file name.')
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    // Donwloading raw video from the GCS
    await downloadRawVideo(inputFileName);

    // Conversion of raw video into 1280x720
    try {
        await convertVideo(inputFileName, outputFileName)
    }   catch(err){
            Promise.all([
                deleteRawVideo(inputFileName),
                deleteProcessedVideo(inputFileName)
            ]);
            return res.status(500).send(`Internval Service error, VIDEO PROCESSING has FAILED`)
        }

    // Uploading processed video into the GCS
    await uploadProcessedVideo(outputFileName);

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(inputFileName)
    ]);
    return res.status(200).send("PROCESS SUCCESSFUL");
});

const port = process.env.PORT || 8080;
app.listen(port, () =>{
    console.log(`video processing services listening at http://localhost:${port}`)
})