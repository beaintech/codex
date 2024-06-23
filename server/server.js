import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai'; // Correct import
import { config } from 'dotenv';
config();

const app = express();
app.use(cors());
app.use(express.json());

// // Initialize OpenAI API with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(process.env.OPENAI_API_KEY);

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Bea!'
  })
})

app.post('/', async (req, res) => {
  try {
    const {prompt} = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).send({ message: 'Invalid input: Prompt must be a non-empty string.' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    console.log(response.choices[0].message, 'res.choices[0].message in server');
    
    res.status(200).send({
      bot: response.choices[0].message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Something went wrong', error: error.message });
  }
});


app.listen(5001, () => console.log('Server started on http://localhost:5001'));
