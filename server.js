//the require things , just memorize + install from trminal

let express = require('express');
let cors = require('cors');
let superagent = require('superagent');
let pg = require('pg');

require('dotenv').config();
const PORT = process.env.PORT;


const DATABASE_URL = process.env.DATABASE_URL;
let client = new pg.Client(DATABASE_URL);


let app = express();
app.use(cors());


//just to test
app.get('/', test)

function test(req, res) {
    res.send('I am Alive')
}




//////////////location//////////////////////

app.get('/location', handleLocation);


function handleLocation(req, res) {
let city = req.query.city;
////from database///

getDataFromDatabase(city).then((result)=>{
     if(result.rowCount > 0 ){
         let dbLoc = result.rows[0];
         let locationObject = new Location(dbLoc.search_query, dbLoc.formatted_query, dbLoc.latitude, dbLoc.longitude);
         res.json(locationObject);
     } else {
         //// from API/////
         getLocationFromAPI(city, res).then(data=>{
             console.log('data in line 28',data);
             addLocationToDatabase(data);
             res.json(data);
         });
     }
    });

}

function getDataFromDatabase(){
    let query = 'SELECT * FROM locations WHERE search_query = $1';
    let values = [city];

    return client.query(query, values).then(result =>{
        // console.log(result);
        return result;
    })
}

function getLocationFromAPI(city, res){
    let key = process.env.GEOCODE_API_KEY;
    superagent.get(`https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`)
        .then((data) => {        
            console.log('data', data.body[0])
            let jsonObject = data.body[0];
            console.log(jsonObject);
            let locationObject = new Location(city, jsonObject.display_name, jsonObject.lat, jsonObject.lon)
            res.status(200).json(locationObject);


        })
        .catch(e => {
            res.send('error.....', e.message);
        });
    console.log('testing the promise')
}

function Location(search_query, formatted_query, latitude, longitude) { // so the data look like the client wants 
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}








/////////////////////////weather///////////////////

app.get('/weather', handleWeather);


function handleWeather(req, res) {

    let city = req.query.city;
    let keyWeth = process.env.WETHCODE_API_KEY;

    // let arrOfDays = [];

    superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${keyWeth}`)
        .then((result) => {  

//////// to add .map/////
    let JsonWatherObject = result.body.data.map((dataWeather)=>{
        return new Weather(dataWeather);
    });

      res.status(200).json(JsonWatherObject);

    });

}


function Weather(forecast, time) {
    this.forecast = forecast;

    this.time = new Date(time).toDateString();
}







/////////trail///////
app.get('/trails',handleTrail);
function Trail(tObject) {
    
        this.name=tObject.name;
        this.location=tObject.location;
        this.length=tObject.length;
        this.stars=tObject.stars;
        this.star_votes=tObject.starVotes;
        this.summary=tObject.summary;
        this.trail_url=tObject.url;
        this.conditions=tObject.conditionStatus;
        this.condition_date=tObject.conditionDate.slice(0,10);
        this.condition_time=tObject.conditionDate.slice(11);
    }

function handleTrail(req,res) {
    let keyT = process.env.TRAIL_API_KEY;
    let lato=req.query.latitude;
    let long=req.query.longitude;
    

    superagent.get(`https://www.hikingproject.com/data/get-trails?lat=${lato}&lon=${long}&maxDistance=200&key=${keyT}`)
    .then(data =>{
        let JsonTrailObject = data.body.trails;
         

    //   JsonWatherData.forEach((value) => {
    //       let weatherObject = new Weather(value.weather.description, value.valid_date);
    //       arrOfDays.push(weatherObject);
    //    });

        
        let value=JsonTrailObject.map(element=>{
            return new Trail(element);
        }).catch(()=>{
            res.status(500).send('sorry,,, wrong')
        })
     
});
}
// trial cons: 










client.connect().then(()=>{
   app.listen(PORT, () =>{

   console.log(`app is listening on port ${PORT}`)
   }); 
 
}).catch(err =>{
    console.log('somtheing is wrong', err);
});

