import fetch from "node-fetch";
import readLine from "readline";

const stopID = "490008660N";
const url = `https://api.tfl.gov.uk/StopPoint/${stopID}/Arrivals`; 

const response = await fetch(url);
const arrivals = await response.json();

// //sort arrivals with time to station
const sortedArrivals = arrivals.sort((a, b) => a.timeToStation - b.timeToStation);
console.log(sortedArrivals)

arrivals.forEach((busArrival) => {
   const minutesUntilBusArrives = Math.floor(busArrival.timeToStation / 60);

   if (minutesUntilBusArrives === 0) {
    console.log(`Bus to ${busArrival.destinationName} is due.`);
  } else {
    console.log(
      `Bus to ${busArrival.destinationName} arriving in ${minutesUntilBusArrives} minutes.`
    );
  }
});

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let postcode;

rl.question("What is your postcode? ", function (answer) {
  console.log(`Postcode confirmation: ${answer}`);
  postcode = answer;
  getPostcodeData(postcode);
  rl.close();
});

async function getPostcodeData (postcode) {
  const urlForPostCodeRequest = `https://api.postcodes.io/postcodes/${postcode}`;
  const input = await fetch(urlForPostCodeRequest);
  const postcodeData = await input.json();
  return console.log(postcodeData);
}


//current errors
//we need to wait for user to put in postcode.
//

//get users input for postcode
//remove any spaces + captilise it
//get long and lat

//url = api.postcodes.io/postcodes/{postcode}
//validate => if status 404 then inform user
//retrieve longitude + latitude
//coords for testing = lat = 51.55411 long = -0.292968
// url for bus stops within long + lat = https://api.tfl.gov.uk/StopPoint/?lat={lat}&lon={lon}&stopTypes={stopTypes}[&radius]
//stop typpes = look for NaptanId watch for children (stop on either side of the road)


//cant use await in a function have to put async in front of it