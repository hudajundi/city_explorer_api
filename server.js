let express = require('express');
let cors = require('cors');


let app = express();
app.use(cors());

require('dotenv').config();

const PORT = process.env.PORT;


app.get('/location' , handleLocation);



function handleLocation(req,res){
    let city = req.query.city;
    let jsonData = require('./data/lacation.json');
    let jsonObject = jsonData[0];
    let locationObject = new Location (city, jsonObject.display_name, jsonObject.lat, jsonObject.lon);
    
    res.status(200).json(locationObject);
}



function Location (search_query, formatted_query, latitude, longitude){ // so the data look like the client wants 
    this.search_query= search_query;
    this.formatted_query=formatted_query;
    this.latitude=latitude;
    this.longitude=longitude;
}


app.listen(PORT,()=>{
    console.log(`app is listening on port ${PORT} `);
});

