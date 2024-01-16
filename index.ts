import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000/',
  ],
}))

app.get('/long-stream/', (req: Request, res: Response) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  // Writing a response header
  res.write('Streaming data:\n');

  // Streaming data to the response
  let count = 0;
  const interval = setInterval(() => {

    count++;
    res.write(`Data ${count}\n`);

    if (count === 2) {
      res.end('Streaming complete!');
      clearInterval(interval);
    }
  }, 1000); // Send data every 1 second
});


app.get('/long-request', (req: Request, res: Response) => {
  let count = 0;
  const interval = setInterval(() => {

    count++;

    if (count === 1) {
      res.json({'message': 'complete!'})
      clearInterval(interval);
    }
  }, 70000); // Send data every 1 second
});


const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

app.get('/json-stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
  const jsonData = {id: 1, name: 'John', address: '1 queen st', phone: 1234567};

  const jsonString = JSON.stringify(jsonData);

  // split chunk to 10 times to simulate real life stream, and wait each of them 1 second
  const numberOfChunks = 10
  const totalLength = jsonString.length;
  let startIndex = 0;
  const chunkSize = Math.ceil(totalLength / numberOfChunks);
  res.write('');
  for (let i = 0; i < numberOfChunks; i++) {
    const chunk = jsonString.substring(startIndex, startIndex + chunkSize);
    res.write(chunk);
    startIndex += chunkSize;
    // wait for 1 second
    await wait(1000);
  }
  res.end('');
})

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});

