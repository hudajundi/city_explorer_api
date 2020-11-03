//the require things , just memorize + install from trminal

let express = require('express');
let cors = require('cors');
require('dotenv').config();

let superagent = require('superagent');
let pg = require('pg');

const PORT = process.env.PORT;



const DATABASE_URL = process.env.DATABASE_URL;
let client = new pg.Client(DATABASE_URL);
client.on('error ', error => {
    console.log(error);
})


let app = express();
app.use(cors());


//just to test
app.get('/', test)

function test(req, res) {
    res.send('I am Alive')
}



//////////////////the "get" functions part:
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/movies', handleMovie);
app.get('/yelp', handleYelp);
app.get('/trails', handleTrail);





//////////////location//////////////////////
function handleLocation(req, res) {
    let city = req.query.city;
    let query = 'SELECT * FROM locations WHERE search_query = $1';
    let values = [city];
    client.query(query, values).then((data) => {
        if (data.rowCount > 0) {
            res.json(data.rows[0])
        }
        else{
            let key = process.env.GEOCODE_API_KEY;
            superagent(`https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`)
                    .then((data) => {        
                        console.log('data', data.body[0])
                        let jsonObject = data.body[0];
                        console.log(jsonObject);
                        let locationObject = new Location(city, jsonObject.display_name, jsonObject.lat, jsonObject.lon)
                        let insertQuery='INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES($1,$2,$3,$4) RETURNING *'
                        let insertValues=[locationObject.search_query,locationObject.formatted_query,locationObject.latitude,locationObject.longitude]
                        client.query(insertQuery,insertValues).then((results)=>{
                            res.json(results.rows[0])
                        }) .catch(e => {
                            res.send('error.....', e.message);
                        });
                        
            })
        }
    })
}    
    

    function Location(search_query, formatted_query, latitude, longitude) { // so the data look like the client wants 
        this.search_query = search_query;
        this.formatted_query = formatted_query;
        this.latitude = latitude;
        this.longitude = longitude;
    }




    /////////movies////////////
    function handleMovie(req, res) {
        let city = req.query.city;
    const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

        superagent.get(`https://api.themoviedb.org/3/movie/76341?api_key=${MOVIE_API_KEY}`)
            .then(data => {
                let dataMovie = data.body.results;
                // console.log(dataMovie);
                let arr = dataMovie.map(element => {
                    return new Movie(element);
                    // console.log(arr);
                });
                res.send(arr);
            }).catch(err => {
                res.status(500).send(' sorry.... error', err);
            });


    }



    ////movie cons :
    function Movie(movieObj) {
        this.title = movieObj.title;
        this.overview = movieObj.overview;
        this.average_votes = movieObj.vote_average;
        this.total_votes = movieObj.vote_count;
        this.image_url = `https://image.tmdb.org/t/p/w500${movieObj.poster_path}`;
        this.popularity = movieObj.popularity;
        this.released_on = movieObj.release_date;
        this.created_at = Date.now();

    }





    ///////////////////yelp////////////
    

    function handleYelp(req, res) {
        let city = req.query.city;
const YELP_API_KEY = process.env.YELP_API_KEY;

        superagent.get(`https://api.yelp.com/v3/businesses/search?location=${city}`).set('Authorization', `Bearer ${YELP_API_KEY}`)

            .then((data) => {
                const dataYelp = data.body.businesses.map((yelpData) => {
                    return new Yelp(yelpData);
                });
                return dataYelp;
            });
        }

        function Yelp(yelpObj) {
            this.name = yelpObj.name;
            this.image_url = yelpObj.image_url;
            this.price = yelpObj.price;
            this.rating = yelpObj.rating;
            this.url = yelpObj.url;
        }



        /////////////////////////weather///////////////////
         function handleWeather(req, res) {
             let city = req.query.city;
            let keyWeth = process.env.WEATHER_API_KEY;
        
        
            superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${keyWeth}`)
                
                .then(data => {
                    let weatherObject = data.body.data;
                    let weatherArr= [];
                    weatherObject.forEach(element => {
                        let toDate = element.datetime;
                        var options = { weekday: 'short', year: 'numeric', day: '2-digit', month: '2-digit' };
                        var today = new Date(toDate);
                        console.log(today.toDateString("en-US", options));
                        let dateFormatted = today.toDateString("en-US", options);
                        let weatherObjCons = new Weather(element.weather.description, dateFormatted);
                        weatherArr.push(weatherObjCons);

                    res.status(200).json(wetherArr);

                })
                .catch(e => {
                    res.send('error.....', e.message);
                });
            console.log('testing the promise');
        }
                )}



        function Weather(forecast, time) {
            this.forecast = forecast;


            this.time = new Date(time).toDateString();
        }







        /////////trail///////
        function Trail(tObject) {

            this.name = tObject.name;
            this.location = tObject.location;
            this.length = tObject.length;
            this.stars = tObject.stars;
            this.star_votes = tObject.starVotes;
            this.summary = tObject.summary;
            this.trail_url = tObject.url;
            this.conditions = tObject.conditionStatus;
            this.condition_date = tObject.conditionDate.slice(0, 10);
            this.condition_time = tObject.conditionDate.slice(11);
        }

        function handleTrail(req, res) {
            let keyT = process.env.TRAIL_API_KEY;
            let lato = req.query.latitude;
            let long = req.query.longitude;

            let SQL1 = `SELECT * FROM trails WHERE latitude='${lato}' AND longitude='${long}';`;
            client.query(SQL1)
            .then(results=>{
              if(results.rows.length == 0){
            superagent.get(`https://www.hikingproject.com/data/get-trails?lat=${lato}&lon=${long}&maxDistance=200&key=${keyT}`)


                .then(traildata => {
                    res.status(200).json(traildata.body.trails.map(item => {
                        const SQL = `INSERT INTO trails (name, location, length, stars, star_votes, summary, trail_url, conditions, condition_date, condition_time, latitude, longitude) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
                        const safeValues = [item.name, item.location, item.length, item.stars, item.starVotes, item.summary, item.url, `${item.conditions}: The trail is ${item.conditionStatus}`, item.conditionDate.split(' ')[0], item.conditionDate.split(' ')[1], lat, lon]
                        client.query(SQL,safeValues)     
                        return new Trail(item)
                    }))
                })
              }else{
                res.status(200).json(results.rows);
              }
            })


    
        }


        function startServer() {
            app.listen(PORT, () => {
                console.log(`listening port at ${PORT}`)
            });
        }



        client.connect().then(startServer)
            .catch((err) => console.log('somtheing is wrong', err));

    
