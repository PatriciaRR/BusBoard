import fetch from "node-fetch";

const postcode = 'W1A 1AA';
const postcodeAPI = await fetch (`https://api.postcodes.io/postcodes/${postcode}`);
const postcodeData = await postcodeAPI.json();

const postcodeLongitude = postcodeData.result.longitude;
const postcodeLatitude = postcodeData.result.latitude;

const stopsAPI = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${postcodeLatitude}&lon=${postcodeLongitude}&stopTypes=NaptanPublicBusCoachTram`)
const stops = await stopsAPI.json();
console.log(stops)

stops.stopPoints.forEach(stopPoint => {
    console.log(`Stop called ${stopPoint.commonName}is located ${Math.floor(stopPoint.distance)} metres away.`)
})

const stopID = "490008660N";
const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopID}/Arrivals`);
const arrivals = await response.json();

//const sortedArrivals = arrivals.sort((a, b) => a.timeToStation - b.timeToStation);

arrivals.forEach((busArrival) => {
    const minutesUntilBusArrives = Math.floor(busArrival.timeToStation / 60);
    console.log(`Bus to ${busArrival.destinationName} arriving in ${minutesUntilBusArrives} minutes.`);
 });
 

 //TO DOs
 // get postcode as input from individual
 // allow individual to see next two buses according to postcode
 // think about postcode validation (do... while loop? keep asking for input if invalid data entered)
//  no bus stop nearby? ... wouldnt the API return the closest? offer closest alternative ?
 // ask input re directions required to arrive to bus stop

