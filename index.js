require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const Phonebook = require("./model/Phonebook");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

// Configure morgan
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/api/persons", (request, response) => {
  Phonebook.find({}).then((phonebook) => {
    response.json(phonebook);
  });
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get("/info", (request, response) => {
  const numPeople = persons.length;
  const reqTime = new Date();
  console.log(reqTime);
  response.send(
    `<p>Phonebook has info for ${numPeople} people</p> <p>${reqTime}</p>`
  );
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const name = body.name;
  const number = body.number;

  if (!name || !number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const person = new Phonebook({
    name: name,
    number: number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
