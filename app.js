const express = require("express");
const app = express();

const sqlite = require("sqlite");
const { open } = sqlite;
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const route = path.join(__dirname, "moviesData.db");
let db = null;
const getDetails = async () => {
  try {
    db = await open({
      filename: route,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

getDetails();
//movie names

const movieNames = (movienames) => {
  return {
    movieName: movienames.movie_name,
  };
};
app.get("/movies/", async (request, response) => {
  const movies = `
    SELECT * 
    FROM movie`;
  const foundMovies = await db.all(movies);
  response.send(foundMovies.map((eachmovie) => movieNames(eachmovie)));
});

//post

app.post("/movies/", async (request, response) => {
  const value = request.body;
  const { directorId, movieName, leadActor } = value;
  const sqlQuery = `
      INSERT INTO
      movie(director_id,movie_name,lead_actor)
      VALUES
      (${directorId},
          '${movieName}',
          '${leadActor}');`;

  const enterDetails = await db.run(sqlQuery);
  response.send("Movie Successfully Added");
});

//get movie details
const getMovieDetails = (details) => {
  return {
    movieId: details.movie_id,
    directorId: details.director_id,
    movieName: details.movie_name,
    leadActor: details.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const sqlText = `
    SELECT * 
    FROM movie 
    WHERE 
    movie_id=${movieId};`;

  const movieDetails = await db.get(sqlText);

  response.send(getMovieDetails(movieDetails));
});

//update movie details
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const sql = `
    UPDATE movie 
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}';`;

  const update = await db.run(sql);
  response.send("Movie Details Updated");
});

//delete
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletesql = `
    DELETE FROM movie 
    WHERE 
    movie_id=${movieId};`;

  const deletemovie = await db.run(deletesql);
  response.send("Movie Removed");
});

//get directors
const directorsList = (list) => {
  return {
    directorId: list.director_id,
    directorName: list.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const get_directors = `SELECT * 
    FROM 
    director;`;

  const directors = await db.all(get_directors);
  response.send(directors.map((eachDirector) => directorsList(eachDirector)));
});

// movies directed by certain directors
const moviesLists = (directorlist) => {
  return {
    movieName: directorlist.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const movie_list = `SELECT * 
    FROM movie 
    WHERE 
    director_id=${directorId}
    ;`;

  const getList = await db.all(movie_list);

  response.send(getList.map((eachMovie) => moviesLists(eachMovie)));
});
module.exports = app;
