let express = require('express');
let cors = require('cors');
const { response } = require('express');



let app = express();
app.use(cors());

require('dotenv').config();

const PORT = process.env.PORT;


app.get('/location' , handleLocation);



function handleLocation(req,res){
    try{
    let city = req.query.city;
    let jsonData = require('./data/lacation.json');
    let jsonObject = jsonData[0];
    let locationObject = new Location (city, jsonObject.display_name, jsonObject.lat, jsonObject.lon);
    
    res.status(200).json(locationObject);
    }
    catch(error){
        response.status(500).send('Sorry, something went wrong');

    }
}



function Location (search_query, formatted_query, latitude, longitude){ // so the data look like the client wants 
    this.search_query= search_query;
    this.formatted_query=formatted_query;
    this.latitude=latitude;
    this.longitude=longitude;
}


/////////weather//////
app.get('/weather',handleWeather);


function handleWeather(request,response){

    let arrOfDays=[];

    try{
        let jsonData = require('./data/weather.json');

        let JsonWatherData = jsonData.data; 

        JsonWatherData.forEach((value) =>{
         let weatherObject = new Weather(value.weather.description,value.valid_date);
         arrOfDays.push(weatherObject);
        });

        response.status(200).send(arrOfDays);
        
    }
    catch(error){
        response.status(500).send('Sorry, something went wrong');
    }
}


function Weather(forecast,time){ 
    this.forecast = forecast; 

    this.time = new Date(time).toDateString() ; 
}



app.listen(PORT,()=>{
    console.log(`app is listening on port ${PORT} `);
});

