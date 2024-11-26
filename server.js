const { default: axios } = require('axios');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (reg, res) => {
    let url = 'https://api.themoviedb.org/3/movie/128135?api_key=5685f5b51423c152c2978da0d4724583';
    axios.get(url)
        .then(response => {
            console.log(response.data.title);
            let data = response.data;
            let releaseDate = new Date(data.release_date).getFullYear();
            let genres = '';

            data.genres.forEach(genre => {
                genres = genres + `${genre.name}, `;
            });

        
            let genresUpdated = genres.slice(0, -2) + '.';
            moviePoster = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`;
            console.log(genresUpdated);
            let currentYear = new Date().getFullYear();
            res.render('index', { movieData: data, releaseDate: releaseDate, genres: genresUpdated, poster: moviePoster, year: currentYear });
        });
    
});

app.get('/search', (req, res) => {
    res.render('search', {movieData:''});
});

app.post('/search', (req, res) => {
    let movieTitle = req.body.movieTitle;

    let movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=5685f5b51423c152c2978da0d4724583&query=${movieTitle}`;
    let genres = 'https://api.themoviedb.org/3/genre/movie/list?api_key=5685f5b51423c152c2978da0d4724583&language=en-US';
   
    let endpoints = [movieUrl, genres];

    axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
    .then(
        axios.spread((movie, genres) => {
            const [general, generalComingSoon] = movie.data.results;
            let movieGenreIds = general.genre_ids;        
            let movieGenres = genres.data.genres; 
            
            let genresArray = [];
            for(let i = 0; i < movieGenreIds.length; i++) { //i++  i+1
                for(let j = 0; j < movieGenres.length; j++) {
                    if(movieGenreIds[i] === movieGenres[j].id) {
                        console.log(movieGenres[j].name);
                        genresArray.push(movieGenres[j].name)
                    }
                    
                }
            }

            let genresToDisplay = '';
            genresArray.forEach(genre => {
                genresToDisplay = genresToDisplay+ `${genre}, `;
            });

            genresToDisplay = genresToDisplay.slice(0, -2) + '.';
            
            let movieObject = {
                title: general.original_title,
                year: new Date(general.release_date).getFullYear(),
                genres: genresToDisplay,
                overview: general.overview,
                posterUrl: `https://image.tmdb.org/t/p/w500/${general.poster_path}`
            };

            res.render('search', {movieData: movieObject});
        })
      );
    
});

app.listen(process.env.PORT || 3000, () => {
    console.log('server is running');
});