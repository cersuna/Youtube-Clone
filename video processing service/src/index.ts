import express from "express";
import ffmpeg from "fluent-ffmpeg"
import { setupDirectories } from "./storage";

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
    // Need to get the path from input video
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath) {
        res.status(400).send("Bad Request: Missing INPUT path.")
    } else if (!outputFilePath) {
        res.status(400).send("Bad Request: Missing OUTPUT path")
    }

})

const port = process.env.PORT || 3000;
app.listen(port, () =>{
    console.log(`video processing services listening at http://localhost:${port}`)
})

