const express = require("express");
const axios = require("axios");
const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
// Define route for downloading PNG file from modified Dropbox URL and storing it locally
// app.get("/download", async (req, res) => {
//   try {
//     const dropboxUrl = req.query.url; // Assuming the URL is passed as a query parameter
//     if (!dropboxUrl) {
//       return res.status(400).send("URL parameter is required");
//     }

//     // Modify Dropbox URL to direct download link
//     const directDownloadUrl = dropboxUrl.replace(
//       "www.dropbox.com",
//       "dl.dropboxusercontent.com"
//     );

//     // Get filename from URL
//     const rawFilename = path.basename(dropboxUrl);
//     const filename = rawFilename.split("?")[0];
//     const filePath = path.join(__dirname, "public", filename); // Save in a 'downloads' directory

//     // Download file from modified Dropbox URL
//     const response = await axios({
//       url: directDownloadUrl,
//       method: "GET",
//       responseType: "stream",
//     });

//     const writer = fs.createWriteStream(filePath);

//     response.data.pipe(writer);
//     writer.on("finish", () => {
//       console.log(`File downloaded successfully and saved at ${filePath}`);
//       const fileContent = fs.readFileSync(filePath);
//       const contentType = {
//         ".png": "image/png",
//         ".jpg": "image/jpeg",
//         ".jpeg": "image/jpeg",
//         ".gif": "image/gif",
//         ".svg": "image/svg+xml",
//         ".webp": "image/webp",
//         ".mp4": "video/mp4",
//         ".avi": "video/avi",
//         ".mov": "video/quicktime",
//         ".wmv": "video/x-ms-wmv",
//         ".flv": "video/x-flv",
//         ".webm": "video/webm",
//         ".mkv": "video/x-matroska",
//         ".pdf": "application/pdf",
//         ".csv": "text/csv",
//         ".xls": "application/vnd.ms-excel",
//         ".xlsx":
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         ".doc": "application/msword",
//         ".docx":
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         ".ppt": "application/vnd.ms-powerpoint",
//         ".pptx":
//           "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//       }[path.extname(filename).toLowerCase()];
//       console.log(filename, "pwpwpw", path.extname(filename).toLowerCase());
//       if (!contentType) {
//         throw new Error("Unsupported file type");
//       }
//       // Prepare S3 upload parameters
//       const uploadParams = {
//         Bucket: "testcontentupload",
//         Key: filename,
//         Body: fileContent,
//         ContentType: contentType,
//         ACL: "public-read",
//       };
//       // Upload file to S3
//       s3.upload(uploadParams, (err, data) => {
//         if (err) {
//           console.error("Error uploading to S3:", err);
//           res.status(500).send("Error uploading to S3");
//         } else {
//           console.log("File uploaded successfully to S3:", data.Location);
//           res.status(200).send({ url: data.Location });
//         }
//       });
//     });

//     writer.on("error", (err) => {
//       console.error("Error saving file:", err);
//       // res.status(500).send('Error saving file');
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Error processing request");
//   }
// });

app.get("/download", async (req, res) => {
  try {
    const dropboxUrl = req.query.url;
    if (!dropboxUrl) {
      return res.status(400).send("URL parameter is required");
    }

    const directDownloadUrl = dropboxUrl.replace(
      "www.dropbox.com",
      "dl.dropboxusercontent.com"
    );

    const rawFilename = path.basename(dropboxUrl);
    const filename = rawFilename.split("?")[0];
    const filePath = path.join("/tmp", filename); // Use /tmp directory for serverless functions

    const response = await axios({
      url: directDownloadUrl,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);
    writer.on("finish", async () => {
      console.log(`File downloaded successfully and saved at ${filePath}`);
      const fileContent = fs.readFileSync(filePath);
      const contentType = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".avi": "video/avi",
        ".mov": "video/quicktime",
        ".wmv": "video/x-ms-wmv",
        ".flv": "video/x-flv",
        ".webm": "video/webm",
        ".mkv": "video/x-matroska",
        ".pdf": "application/pdf",
        ".csv": "text/csv",
        ".xls": "application/vnd.ms-excel",
        ".xlsx":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".doc": "application/msword",
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      }[path.extname(filename).toLowerCase()];

      if (!contentType) {
        throw new Error("Unsupported file type");
      }

      const uploadParams = {
        Bucket: "testcontentupload",
        Key: filename,
        Body: fileContent,
        ContentType: contentType,
        ACL: "public-read",
      };

      // Upload file to S3
      s3.upload(uploadParams, (err, data) => {
        if (err) {
          console.error("Error uploading to S3:", err);
          res.status(500).send("Error uploading to S3");
        } else {
          console.log("File uploaded successfully to S3:", data.Location);
          res.status(200).send({ url: data.Location });
        }
      });
    });

    writer.on("error", (err) => {
      console.error("Error saving file:", err);
      res.status(500).send("Error saving file");
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing request");
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
