document.addEventListener("DOMContentLoaded", () => {
    const searchTermInput = document.getElementById('movie-term');
    const movieListContainer = document.getElementById("movie-list-container");
    const selectedMovieContainer = document.getElementById("selected-movie");
    const errorBox = document.getElementById("error-box");
    const loadingSpinner = document.getElementById("loading-spinner");

    searchTermInput.addEventListener("input", debounce(movieList, 300));

    function movieList() {
        function displayError(message) {
        errorBox.innerHTML = `<p>${message}</p>`;
        errorBox.style.display = "block";
    }

        const searchTerm = searchTermInput.value.trim();
        if (searchTerm === "") {
            movieListContainer.innerHTML = "";
            return;
        }

        showLoadingSpinner();

        fetch(`http://www.omdbapi.com/?apikey=a9a6768&s=${searchTerm}&plot=full`)
            .then(response => response.json())
            .then(data => {
                if (data.Error) {
                    displayError(data.Error);
                } else {
                    displayMovies(data.Search);
                }
            })
            .catch(error => {
                displayError("An error occurred while fetching data.");
            })
            .finally(() => {
                hideLoadingSpinner();
            });
    }

    function displayMovies(movies) {
        errorBox.style.display = "none"; 
        selectedMovieContainer.innerHTML = ""; 

        const output = movies.map(movie => `
            <div class="movie-list-card">
                <img src="${movie.Poster}">
                <a href="#" data-imdbid="${movie.imdbID}">${movie.Title}</a>
            </div>`
        ).join("");

        movieListContainer.innerHTML = output;

        const movieLinks = document.querySelectorAll('.movie-list-card a');
        movieLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const imdbID = link.getAttribute('data-imdbid');
                getMovieDetails(imdbID);
            });
        });
    }

    function getMovieDetails(movieId) {
        showLoadingSpinner();

        fetch(`http://www.omdbapi.com/?apikey=a9a6768&i=${movieId}`)
            .then(response => response.json())
            .then(data => {
                displaySelectedMovie(data);
            })
            .catch(error => {
                displayError("An error occurred while fetching movie details.");
            })
            .finally(() => {
                hideLoadingSpinner();
            });
    }


    function showLoadingSpinner() {
        loadingSpinner.style.display = "block";
    }

    function hideLoadingSpinner() {
        loadingSpinner.style.display = "none";
    }

    function debounce(func, delay) {
        let timeoutId;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    function displaySelectedMovie(movie) {
        const output = `
            <div class="row">
                <div class="col-md-4">
                    <img src="${movie.Poster}" class="img-thumbnail">
                </div>
                <div class="col-md-8">
                    <h2>${movie.Title}</h2>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item"><strong>Genre: </strong> ${movie.Genre}</li>
                        <li class="list-group-item"><strong>Released: </strong> ${movie.Released}</li>
                        <li class="list-group-item"><strong>Rated: </strong> ${movie.Rated}</li>
                        <li class="list-group-item"><strong>IMDB Rating: </strong> ${movie.imdbRating}</li>
                        <li class="list-group-item"><strong>Director: </strong> ${movie.Director}</li>
                        <li class="list-group-item"><strong>Writer: </strong> ${movie.Writer}</li>
                        <li class="list-group-item"><strong>Actors: </strong> ${movie.Actors}</li>
                    </ul>
                </div>
            </div>
            <div class="row pt-4">
                <div class="card">
                    <h3>Plot</h3>
                    ${movie.Plot}
                    <hr>
                    <a href="http://imdb.com/title/${movie.imdbID}" target="_blank" class="btn btn-dark">View IMDB</a>
                    <a href="#" onclick="goBackToSearch()" class="btn btn-default">Go Back To Search</a>
                </div>
            </div>
        `;

        selectedMovieContainer.innerHTML = output;
    }

});

