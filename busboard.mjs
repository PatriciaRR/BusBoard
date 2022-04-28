import fetch from "node-fetch";
import readLine from "readline";

const response = await fetch("https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals")
const arrivals = await response.json();

console.log(arrivals);

arrivals.sort((a, b) => a.timeToStation - b.timeToStation);

arrivals.forEach((busArrival) => {
    const minutesUntilBusArrives = Math.floor(busArrival.timeToStation / 60);

  if (minutesUntilBusArrives === 0) {
    console.log(`Bus to ${busArrival.destinationName} is due.`);
  } else {
    console.log(`Bus to ${busArrival.destinationName} arriving in ${minutesUntilBusArrives} minutes.`);
  }
});

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("What is your postcode? ", function (answer) {
  console.log(`Postcode confirmation: ${answer}`);
  rl.close();
});
