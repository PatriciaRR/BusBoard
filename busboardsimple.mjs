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
    
    //handling incorrect postcodes
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

if (busStopsJSON.stopPoints.length === 0) {
    console.log('No stops found within 200m radius'),
    logger.warn('No stops found within 200m radius')
}

const sortedLocalStops = busStopsJSON.stopPoints.sort((a,b) => a.distance - b.distance)
const closest3BusStops = sortedLocalStops.slice(0,3);

for (const stop of closest3BusStops) { // if using forEach (i.e. function), unable to use 'await'
    console.log(`${stop.commonName} is ${Math.round(stop.distance)} metres away`);
    const arrivalsAPI = await fetch(`https://api.tfl.gov.uk/StopPoint/${stop.naptanId}/Arrivals`)
    const arrivalsJSON = await arrivalsAPI.json();

    const sortedArrivals = arrivalsJSON.sort((a,b) => a.timeToStation - b.timeToStation).slice(0,5)

    sortedArrivals.forEach (arrival =>  { 
        if (`${arrival.timeToStation}` < 60) {
            console.log(`***The next bus travelling towards ${arrival.destinationName} is due` )
        } else {
            console.log(`   ***The next bus travelling towards ${arrival.destinationName} arrives in ${Math.floor(arrival.timeToStation/60)} minutes`)
        }
    })  
}




