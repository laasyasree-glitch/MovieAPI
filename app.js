const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app = express();

let db = null;
const dbPath = path.join(__dirname, "moviesData.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
  app.listen(3002, () => {
    console.log("Server started t port Number 3002");
  });
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//GET ALL MOVIES LIST
app.get("/movies/", async (request, response) => {
  const getAllMoviesSQlQuery = `SELECT movie_name from movie order by movie_id`;
  const result = await db.all(getAllMoviesSQlQuery);
  response.send(
    result.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//POST MOVIE
app.use(express.json());
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  console.log(directorId, movieName, leadActor);

  const postQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    values (${directorId},'${movieName}','${leadActor}')
    `;
  await db.run(postQuery);
  response.send("Movie Successfully Added");
});

//GET SPECIFIC MOVIES LIST
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getAllMovieSQlQuery = `SELECT * from movie where movie_id=${movieId}`;
  const result = await db.get(getAllMovieSQlQuery);
  console.log(convertDbObjectToResponseObject(result));
  response.send(convertDbObjectToResponseObject(result));
});

//UPDATE A MOVIE OBJECT
app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  console.log(movieId, directorId, movieName, leadActor);
  const updateQuery = `update movie set 
    director_id=${directorId}, 
    movie_name='${movieName}, 
    lead_actor='${leadActor}'
     where movie_id=${movieId}`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `Delete from movie where movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getAllDirectorsSQlQuery = `SELECT * from director order by director_id`;
  const result = await db.all(getAllDirectorsSQlQuery);
  response.send(
    result.map((eachDirector) => convertDbObjectToResponseObject2(eachDirector))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getAllSQlQuery = `SELECT * from movie where director_id=${directorId}`;

  const result = await db.all(getAllSQlQuery);
  response.send(
    result.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
