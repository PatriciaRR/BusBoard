import fetch from "node-fetch";
import readline from "readline-sync";

const stopID = "490008660N";

async function getBusInfoFor(stopID) {
  const url = `https://api.tfl.gov.uk/StopPoint/${stopID}/Arrivals?app_key=5716904db8c14735b9a633fd6523ee11`;
  const response = await fetch(url);
  const busInfo = await response.json();

  return await busInfo;
}

function logBusArrivalTimes(busInfo) {
  const arrivals = busInfo;

  arrivals.sort((a, b) => a.timeToStation - b.timeToStation);

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
}

async function getPostcodeData(postcode) {
  const urlForPostCodeRequest = `https://api.postcodes.io/postcodes/${postcode}`;
  const postcodeJSON = await fetch(urlForPostCodeRequest);
  return await postcodeJSON.json();
}

async function getCloseStopIDS(coords) {
  const lon = coords.longitude;
  const lat = coords.latitude;
  const stopsIdAPI = await fetch(
    `https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=NaptanPublicBusCoachTram&radius=500`
  );
  return await stopsIdAPI.json();
}

function sortBusStopData(postcodeJSON) {
  const stopIDs = postcodeJSON.stopPoints;
  const busStopInfo = [];

  stopIDs.forEach((stop) => {
    busStopInfo.push({
      id: stop.naptanId,
      distance: Math.floor(stop.distance),
    });
  });

  busStopInfo.sort((a, b) => {
    return a.distance - b.distance;
  });
  return busStopInfo.slice(0, 2);
}


console.log('Please enter a postcode.');
let postcode = readline.prompt().toLocaleUpperCase().trim();

let postcodeData;

let postcodeValid = false;
while (!postcodeValid) {
    
    try {
        postcodeData = await getPostcodeData(postcode);
        if (postcodeData.result === undefined) { 
            throw new Error ('Invalid postcode entered')
        }
        else {
        postcodeValid = true;
        }

    } catch (err) {
        console.log ('Postcode not recognised. \nPlease enter a valid postcode.')
        postcode = readline.prompt();    
    }
}
  const postcodeLocation = {
    longitude: postcodeData.result.longitude,
    latitude: postcodeData.result.latitude,
  };

  let stopIDs;

  let stopIDValid = false;
  while (!stopIDValid) {
      //let stopIDsJSON;
      try {
          const stopIDsJSON = await getCloseStopIDS(postcodeLocation);
          if (stopIDsJSON.httpStatusCode === 400) { 
              throw new Error ('Server error')
          } else if (stopIDsJSON.stopPoints.length === 0) {
              throw new Error ('No stops in range')
          }
          else {
              //stopID = sortBusStopData(stopIDsJSON);
              stopIDValid = true;
            }
  
      } catch (err) {
          console.log ('CATCH No stops in range')
              
      }
    }
  //TODO: do we need this for the user?
  console.log(
    `\nLogging data for these stop ids: ${stopIDs[0].id}, ${stopIDs[1].id}`
  );

  for (const stop of stopIDs) {
    const busInfo = await getBusInfoFor(stop.id);
    //if tfl data is good, continue on.
    //TODO: if not good, do what?
    console.log(`\n\nBus times for stop: ${busInfo[0].stationName}\n`);
    logBusArrivalTimes(busInfo);
  }



//TODO: actually log out bus times ✅
//TODO: validate the postcode - DONE
//TODO: validate the bus stops - what if it returns an empty array

//TODO: Fix crashing if theres no bus stops
//TODO: winston library