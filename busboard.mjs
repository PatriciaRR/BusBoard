import fetch from "node-fetch";
import readLine from "readline";

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

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("What is your postcode? ", async (answer) => {
  //TODO: potentially do some error handling here
  const postcode = answer.toLocaleUpperCase().trim();
  let postcodeData;

  let postcodeValid = false;
  while (!postcodeValid) {
    
    try {
        postcodeData = await getPostcodeData(postcode);
        if (!postcodeValidationJSON.result) { //.result is object value ~ si no existe el objeto creado cdo se da un postcode valido a la api, throw err
            throw new Error ('Invalid postcode entered')
        }
        else {postcodeValid = true;}

    } catch (err) {
        console.log ('Postcode not recognised. \nPlease enter a valid postcode.')
        userPostcode = readline.prompt();    
    }
}
  //if postcode data is good, continue on.
  //Else prompt use to try again.
  //if it still doesn't work quit with letting user know the reason
  const postcodeLocation = {
    longitude: postcodeData.result.longitude,
    latitude: postcodeData.result.latitude,
  };

  const stopIDsJSON = await getCloseStopIDS(postcodeLocation);
  //if tfl data is good, continue on.
  //TODO: if not good, do what?
  const stopIDs = sortBusStopData(stopIDsJSON);

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

  rl.close();
});

//TODO: actually log out bus times ✅
//TODO: validate the postcode
//TODO: validate the bus stops - what if it returns an empty array

//TODO: Fix crashing if theres no bus stops
//TODO: winston library