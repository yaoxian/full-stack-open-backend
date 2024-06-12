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

app.get("/info", (request, response) => {
  const reqTime = new Date();
  Phonebook.find({}).then((phonebook) => {
    const numPeople = phonebook.length;
    response.send(
      `<p>Phonebook has info for ${numPeople} people</p> <p>${reqTime}</p>`
    );
  });
});

app.get("/api/persons/:id", (request, response) => {
  Phonebook.findById(request.params.id)
    .then((result) => {
      response.json(result);
    })
    .catch((err) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  Phonebook.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  const phonebook = {
    name: body.name,
    number: body.number,
  };

  Phonebook.findByIdAndUpdate(request.params.id, phonebook, { new: true })
    .then((updatedPhonebook) => {
      response.json(updatedPhonebook);
    })
    .catch((err) => {
      next(err);
    });
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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
