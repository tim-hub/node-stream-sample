import express, { Application, Request, Response } from 'express';
import axios from 'axios';
import { Transform } from 'stream';
import { makeStreamingJsonRequest } from 'http-streaming-request';


const proxyApp: Application = express();
const port = 9000;


const sourceApiUrl = 'http://localhost:8000/json-stream';

proxyApp.get('/pipe-json-stream/', async (req: Request, res: Response) => {
  try {
    const streamResponse = await axios.get(sourceApiUrl, {responseType: 'stream'});
    res.writeHead(200, {'Content-Type': 'text/plain'});
    // Pipe the API response data to the Readable stream
    streamResponse.data.pipe(res);

  } catch (error: any) {
    console.error('API request error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// use transformer to update the stream
proxyApp.get('/pipe-modify-stream/', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(sourceApiUrl, {responseType: 'stream'});
    res.setHeader('Content-Type', 'application/json');
    // Create a transform stream to modify the data
    const modifyStream = new Transform({
      transform(chunk, encoding, callback: any) {
        // Modify the chunk (e.g., convert to uppercase)
        const modifiedChunk = chunk.toString().replace('\n', '').toUpperCase();
        // Pass the modified data to the next stream in the pipeline
        callback(null, modifiedChunk);
      }
    });

    // Pipe the API response data through the transform stream and then to the client response
    response.data.pipe(modifyStream).pipe(res);
  } catch (error: any) {
    console.error('API request error:', error);
    res.status(500).send('Internal Server Error');
  }
});

proxyApp.get('/pipe-modify-json-stream/', async (req: Request, res: Response) => {
  try {
    const stream = makeStreamingJsonRequest<any>({
      url: sourceApiUrl,
      method: "GET",
    });

    res.setHeader('Content-Type', 'application/json');

    for await (const data of stream) {
      // if the API only returns [{"name": "Joe
      // the line below will print `[{ name: "Joe" }]`
      const modifiedData = data
      console.log(modifiedData);
      modifiedData.modified = true;
      res.write(JSON.stringify(modifiedData));
    }
    res.end('');
  } catch (error: any) {
    console.error('API request error:', error);
    res.status(500).send('Internal Server Error');
  }
});

proxyApp.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

