// Handle GCS file interactions + Local file interactions

import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = "whale-yt-raw-videos";
const processedVideoBucketName = "whale-ty-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/*
    Creating local directories for videos downloaded from GCS and directory for processed video
  */

function ensureDirectoryExistence(dirPath: string){
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created at ${dirPath}`);
    }
}

export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

export function convertVideo(rawVideoName: string, processedVideoName: string){
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=1280:720") //make sure this works
        .on("end", function () {
            console.log(`Video Proceesing Finished Successfully`)
            resolve();
        })
        .on("error", function (err: any) {
            console.log(`An error occured: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    })
}

export async function downloadRawVideo(fileName: string){
   await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({ destination: `${localRawVideoPath}/${fileName}` });

    console.log(`${fileName} has finished processing`)
    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    )
}

export async function uploadProcessedVideo(fileName: string){
    const bucket = storage.bucket(processedVideoBucketName)
    await storage.bucket(processedVideoBucketName).upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName,
    });
    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    )
    await bucket.file(fileName).makePublic();
}


export function deleteRawVideo(fileName: string){
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName: string){
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)){
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file at ${filePath}`, err);
                } else {
                    console.log(`File was deleted at ${filePath}`)
                    resolve();
                }
            })
            reject(`File ${filePath} does not exist.`);
        } else {
            console.log(`File not found at ${filePath}, nothing was deleted`);
            resolve();
        }
    })
}