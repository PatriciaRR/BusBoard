import fetch from "node-fetch";

const response = await fetch("https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals")
const arrivals = await response.json();

console.log(arrivals);

arrivals.sort((a,b) => a.timeToStation - b.timeToStation);