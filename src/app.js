const express = require("express");
const cors = require("cors");
const { v4: createId, validate: isIdValid } = require("uuid");

const app = express();
const repositories = [];

function validateId(request, response, next) {
  const { id } = request.params;
  if (id == undefined || !isIdValid(id)) {
    console.log("Id is incorrect");
    return response.status(400).json({ error: "Id is incorrect" });
  }
  const repositoryIndex = repositories.findIndex((repo) => repo.id === id);
  const idNotExist = repositoryIndex < 0;
  if (idNotExist) {
    console.log("Id not exist");
    return response.status(400).json({ error: "Id not found" });
  }

  request.repositoryIndex = repositoryIndex;
  return next();
}

app.use(express.json());
app.use(cors());
app.use("/repositories/:id", validateId);

app.get("/repositories", (_, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = _repositoryFactory(title, url, techs);
  repositories.push(repository);
  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  const { repositoryIndex } = request;

  repositories[repositoryIndex].title = title;
  repositories[repositoryIndex].url = url;
  repositories[repositoryIndex].techs = techs;

  return response.json(repositories[repositoryIndex]);
});

app.delete("/repositories/:id", (request, response) => {
  const { repositoryIndex } = request;
  repositories.splice(repositoryIndex);
  console.log(`index: ${repositoryIndex}`);
  console.log(`atualRepositories: ${repositories}`);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { repositoryIndex } = request;
  const repository = repositories[repositoryIndex];
  repository.likes++;
  return response.json(repository);
});

function _repositoryFactory(title, url, techs) {
  return {
    id: createId(),
    title: title,
    url: url,
    techs: techs,
    likes: 0,
  };
}

module.exports = app;
