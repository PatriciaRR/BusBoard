import fetch from "node-fetch"; 
import readline from "readline-sync"; 
import winston from 'winston'

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'combined log'})
    ]
})

let postcodeAPI;
let postcodeJSON;

let postcodeValid = false; // force loop

while (!postcodeValid) {
    
    console.log('Please enter a valid postcode.');
    let userPostcode = readline.prompt();
    
    //errors when fetching from API
    try {
        postcodeAPI = await fetch(`https://api.postcodes.io/postcodes/${userPostcode}`);
        postcodeJSON = await postcodeAPI.json();
        if (postcodeJSON.result === undefined) { 
            logger.error(`Fetch to https://api.postcodes.io/postcodes/${userPostcode} returned a non-success status code`)
            console.error(`Fetch to https://api.postcodes.io/postcodes/${userPostcode} returned a non-success status code`)
            throw new Error (`${userPostcode} is not a valid postcode`)
        }
        else {postcodeValid = true;}

    } catch (err) {
        logger.warn(`Asking user to re-enter postcode info after a non-successful fetch`)
        console.log (`Postcode \"${userPostcode}\" is not recognised.`)   
        continue; 
    }
}

const busStopsAPI = await fetch (`https://api.tfl.gov.uk/StopPoint/?lat=${postcodeJSON.result.latitude}&lon=${postcodeJSON.result.longitude}&stopTypes=NaptanPublicBusCoachTram&radius=200`)
const busStopsJSON = await busStopsAPI.json();
//if (busStopsJSON === {}) {
    //throw 'No bus stops within set radius'
//} else {

const sortedLocalStops = busStopsJSON.stopPoints.sort((a,b) => a.distance - b.distance)
const closestBusStops = [];
sortedLocalStops.forEach(stop => closestBusStops.push([stop.commonName, Math.round(stop.distance), stop.id]));
console.log(closestBusStops)
const key2BusStops = sortedLocalStops.slice(0,2)

//console.log(busStopsJSON.stopPoints.commonName)




// Loop to get ID of closest TWO stops to confirm arrivals
// let stopID = ''
// for(let i = 0; i < 2; i++) {
//     stopID = key2BusStops[i][2]
// }
// const arrivalsAPI = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopID}/Arrivals`)
// const arrivalsJSON = await arrivalsAPI.json();
// console.log(arrivalsJSON)

// const nextArrivals = []
// arrivalsJSON.forEach(bus => nextArrivals.push([bus.lineName, bus.destinationName, Math.round(bus.timeToStation/60)]));
// const sortedArrivals = nextArrivals.sort((a,b)=> a.timeToStation - b.timeToStation) // not sorting???
// //console.log(sortedArrivals)
// for (let i = 0; i < sortedArrivals.length; i++) {
//         console.log(`Bus ${sortedArrivals[i][0]} towards ${sortedArrivals[i][1]} will arrive in ${sortedArrivals[i][2]} minutes`);
// }
 



