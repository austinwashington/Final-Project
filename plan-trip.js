const statusEl = document.getElementById("tripPlannerStatus");
const stepsEl = document.getElementById("tripSteps");
const fromInput = document.getElementById("tripFrom");
const toInput = document.getElementById("tripTo");
const goBtn = document.getElementById("tripGoBtn");

let map;
let directionsService;
let directionsRenderer;

function setStatus(message) {
  statusEl.textContent = message;
}

// Called automatically by the Google Maps script tag once it finishes loading
function initMap() {
  map = new google.maps.Map(document.getElementById("tripMap"), {
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  goBtn.addEventListener("click", planTrip);
  toInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") planTrip();
  });
}

function formatTransitStep(step, index) {
  const li = document.createElement("li");
  const transit = step.transit;
  const lineName = transit.line.short_name || transit.line.name || "Bus";
  const vehicle = transit.line.vehicle?.name || "Bus";
  const boardStop = transit.departure_stop.name;
  const alightStop = transit.arrival_stop.name;
  const departTime = transit.departure_time.text;
  const arriveTime = transit.arrival_time.text;
  const numStops = transit.num_stops;

  li.innerHTML =
    `<strong>${vehicle} ${lineName}</strong><br>` +
    `Board at <strong>${boardStop}</strong> at ${departTime}<br>` +
    `Ride ${numStops} stop${numStops === 1 ? "" : "s"}, get off at <strong>${alightStop}</strong> at ${arriveTime}`;
  li.classList.add("trip-step-transit");
  return li;
}

function formatWalkStep(step) {
  const li = document.createElement("li");
  li.innerHTML = `Walk ${step.distance.text} (${step.duration.text}) — ${step.instructions}`;
  li.classList.add("trip-step-walk");
  return li;
}

function renderItinerary(result) {
  stepsEl.innerHTML = "";
  const leg = result.routes[0].legs[0];

  leg.steps.forEach((step, i) => {
    if (step.travel_mode === "TRANSIT") {
      stepsEl.appendChild(formatTransitStep(step, i));
    } else {
      stepsEl.appendChild(formatWalkStep(step));
    }
  });

  const summary = document.createElement("p");
  summary.className = "trip-summary";
  summary.textContent = `Total trip time: about ${leg.duration.text}, arriving around ${leg.arrival_time ? leg.arrival_time.text : "the estimated time above"}.`;
  stepsEl.parentNode.insertBefore(summary, stepsEl);
}

function planTrip() {
  const origin = fromInput.value.trim();
  const destination = toInput.value.trim();

  if (!origin || !destination) {
    setStatus("Please enter both a starting point and a destination.");
    return;
  }

  setStatus("Looking up transit directions...");
  stepsEl.innerHTML = "";

  directionsService.route(
    {
      origin,
      destination,
      travelMode: google.maps.TravelMode.TRANSIT,
      transitOptions: {
        departureTime: new Date()
      }
    },
    (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
        renderItinerary(result);
        setStatus("Here's your trip:");
      } else if (status === "ZERO_RESULTS") {
        setStatus("No transit route found between those two points.");
      } else {
        setStatus("Couldn't get directions (" + status + "). Check your addresses and try again.");
      }
    }
  );
}
