import express from "express";
import ffmpeg from "fluent-ffmpeg"

const app = express();
const port = 3000;

app.post("/process-video", (req, res) => {
    // Need to get the path from input video
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath) {
        res.status(400).send("Bad Request: Missing INPUT path.")
    } else {
        res.status(400).send("Bad Request: Missing OUTPUT path")
    }

    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=1280:720") //make sure this works
        .on("end", () => {

        })
        .on("error", (err) => {
            console.log(`An error occured: ${err.message}`);
            res.status(500)
        })
})

app.listen(port, () =>{
    console.log(`video processing services listening at http://localhost:${port}`)
})