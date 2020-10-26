let express = require('express');
let cors = require('cors');
const superagent = require('superagent');



let app = express();
app.use(cors());

require('dotenv').config();

const PORT = process.env.PORT;


app.get('/location' , handleLocation);



function handleLocation(req,res){
    let city = req.query.city;
    let key= process.env.GEOCODE_API_KEY;
    superagent.get(``) . then((data)=>{        //////NOTE:  I didn't understand how to get the link and the key 
    let jsonObject = data.body[0];
    console.log(jsonObject);
    let locationObject = new Location (city, jsonObject.display_name, jsonObject.lat, jsonObject.lon)
     res.status(200).json(locationObject);

    
}) .catch(()=>{
    res.wend('error.....');
});
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

        //////// to add .map/////

        // response.status(200).send(arrOfDays);          /// we use instead:
        response.status(200).json(wetherdata.body.data.map(); 
        
        
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

