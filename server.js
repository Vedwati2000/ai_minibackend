const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const Chat = require('./models/Chat');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.GEMINI_API_KEY;

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('MongoDB Connected!')
})
.catch((err) => {
    console.log(err)
})

app.post("/ask-gemini", async (req, res) => {

    try {

        const userQuestion = req.body.question;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: userQuestion
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        console.log(data);

        if (!response.ok) {

            return res.status(500).json({
                error: data.error.message
            });

        }

        const answer =
        data.candidates[0].content.parts[0].text;

        const newChat = new Chat({
            question : userQuestion,
            answer : answer
        })

        await newChat.save()

        res.json({
            reply: answer
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Something went wrong"
        });

    }

});
const PORT = 3000;

app.listen(PORT, () => {

    console.log(`Server running on port http://localhost:${PORT}`);

});