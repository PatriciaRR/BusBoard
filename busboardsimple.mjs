import fetch from "node-fetch"; 
import readline from "readline-sync"; 

//get user postcode input & verification
console.log('Please enter a postcode.');
let userPostcode = readline.prompt();

//verify user input 
let postcodeValid = false; // to force code down the while loop

while (!postcodeValid) {
    
    try {
        const postcodeValidationAPI = await fetch(`https://api.postcodes.io/postcodes/${userPostcode}`);
        const postcodeValidationJSON = await postcodeValidationAPI.json();
        if (!postcodeValidationJSON.result) { //.result is object value ~ si no existe el objeto creado cdo se da un postcode valido a la api, throw err
            throw new Error ('Invalid postcode entered')
        }
        else {postcodeValid = true;}

    } catch (err) {
        console.log ('Postcode not recognised. \nPlease enter a valid postcode.')
        userPostcode = readline.prompt();    
    }
}

//longitude and latitude data
const postcodeAPI = await fetch(`https://api.postcodes.io/postcodes/${userPostcode}`);
const postcodeJSON = await postcodeAPI.json();
const longitude = postcodeJSON.result.longitude;
const latitude = postcodeJSON.result.latitude;


//TfL API - closest TWO bus stops

// try
const busStopsAPI = await fetch (`https://api.tfl.gov.uk/StopPoint/?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram&radius=200`)
const busStopsJSON = await busStopsAPI.json();
//if (busStopsJSON === {}) {
    //throw 'No bus stops within set radius'
//} else {

const localBusStops = busStopsJSON.stopPoints;
const closestBusStops = [];
localBusStops.forEach(stop => closestBusStops.push([stop.commonName, Math.round(stop.distance), stop.id]));
const key2BusStops = closestBusStops.sort((a,b) => a.distance - b.distance).slice(0,2)
//}
// catchexeption is no bus stops in vecinity
//catch (err) {
// console.log('There are no bus tops nearby / specified ratius)
// throw err
//}




// Loop to get ID of closest TWO stops to confirm arrivals
let stopID = ''
for(let i = 0; i < 2; i++) {
    stopID = key2BusStops[i][2]
}
const arrivalsAPI = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopID}/Arrivals`)
const arrivalsJSON = await arrivalsAPI.json();
console.log(arrivalsJSON)

const nextArrivals = []
arrivalsJSON.forEach(bus => nextArrivals.push([bus.lineName, bus.destinationName, Math.round(bus.timeToStation/60)]));
const sortedArrivals = nextArrivals.sort((a,b)=> a.timeToStation - b.timeToStation) // not sorting???
//console.log(sortedArrivals)
for (let i = 0; i < sortedArrivals.length; i++) {
        console.log(`Bus ${sortedArrivals[i][0]} towards ${sortedArrivals[i][1]} will arrive in ${sortedArrivals[i][2]} minutes`);
}
 
//CONSIDER...
//differenciate between incorrect data entered and correct postcode outside London region
//error handling for no stops in set radius
//error handling for no buses coming

//CHECK..
//is sorting of next two buses according to time actually happening?? sorting bus number??


