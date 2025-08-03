"use strict";

const form = document.querySelector("form");
let weatherContainer = document.querySelector(".weather-container");
const mainInfoContainer = document.querySelector(".main__info");
const mainForecastContainer = document.querySelector(".main__forecast");
const placesContainer = document.querySelector(".places__container");
const geolocationButton = document.querySelector(".places__geolocation");
let mainForecastCardContainer = document.querySelector(
  ".forecast__card--container"
);
const unitSelector = document.querySelector("#unit-selector");
const today = new Date();

console.log(today);

let searchTerm;
let currentWeather;
let geolocation;
let geolocationAddress;

let lat, lon;

let selectedUnit = "C";

// Function to convert temperature from Fahrenheit to Celsius
function convertTemp(tempF, selectedUnit) {
  if (selectedUnit === "C") {
    return (((tempF - 32) * 5) / 9).toFixed(1);
  }
  return tempF.toFixed(1); // °F
}

// function to convert date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: "short", day: "numeric" };
  const formatted = date.toLocaleDateString("en-GB", options);

  return formatted; // Ex: "Mon 4"
}

function updateUI() {
  let weatherCard = `
    
    <p class="main__info--city">${currentWeather.resolvedAddress}</p>
          <img
            class="main__info--icon"
            src="./assets/weather-icons/${
              currentWeather.currentConditions.icon
            }.svg"
            alt="Weather Icon"
          />
          <p class="main__info--temp">${convertTemp(
            currentWeather.currentConditions.temp,
            selectedUnit
          )}°${selectedUnit}</p>

          <p class="main__info--conditions">${
            currentWeather.currentConditions.conditions
          }</p>
          <p class="main__info--highandlow">🔥 H: ${convertTemp(
            currentWeather.days[0].tempmax,
            selectedUnit
          )}°${selectedUnit} ❄️ L: ${convertTemp(
    currentWeather.days[0].tempmin,
    selectedUnit
  )}°${selectedUnit}</p>
          <p class="main__info--rain">☔️ Chance of Rain: ${
            currentWeather.currentConditions.precipprob
          }%</p>
          <p class="main__info--description">${currentWeather.description}</p>
          ${
            currentWeather.alerts.length === 0
              ? `<p class="main__info--alert">Weather Alert: No alerts</p>`
              : `${currentWeather.alerts
                  .map((e) => {
                    return `<p class="main__info--alert">Weather Alert: ${e} </p>`;
                  })
                  .join(" ")}</p>`
          }  
`;

  mainInfoContainer.innerHTML = "";
  //   mainForecastCardContainer.innerHTML = "";
  mainForecastContainer.innerHTML = "";
  mainForecastContainer.insertAdjacentHTML(
    "afterbegin",
    `<h2>Next 7 Days</h2>
          <div class="forecast__card--container"></div>`
  );

  mainForecastCardContainer = document.querySelector(
    ".forecast__card--container"
  );

  mainInfoContainer.insertAdjacentHTML("afterbegin", weatherCard);

  let nextSevenDays = [];
  currentWeather.days.forEach((date) => {
    if (
      date.datetime > today.toISOString().split("T")[0] &&
      nextSevenDays.length < 7
    ) {
      nextSevenDays.push(date);
    }
  });

  nextSevenDays.forEach((day, index) => {
    let forecastCard = ` 
        <div class="forecast__card">
              <p class="forecast__item--hour">${formatDate(day.datetime)}</p>
              <img
                class="forecast__item--icon"
                src="./assets/weather-icons/${day.icon}.svg"
                alt="Weather Icon"
              />
              <p class="forecast__item--temp">${convertTemp(
                day.temp,
                selectedUnit
              )}°${selectedUnit}</p>
              <p class="forecast__item--description">${day.description
                .split(" ")
                .slice(0, 2)
                .join(" ")}</p>
              <p class="forecast__item--highlow">H: ${convertTemp(
                day.tempmax,
                selectedUnit
              )}°${selectedUnit} L: ${convertTemp(
      day.tempmin,
      selectedUnit
    )}°${selectedUnit}</p>
            </div> 
`;
    mainForecastCardContainer.insertAdjacentHTML("beforeend", forecastCard);
  });
}

// Get the current geolocation
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;

      console.log(lat, lon);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      geolocation = data;
      geolocationAddress = `${geolocation.address.suburb}, ${geolocation.address.city}, ${geolocation.address.country}`;
      geolocationButton.innerHTML = `📍 ${geolocationAddress}`;
      console.log(geolocation);
    },
    (error) => {
      console.error("Error obtaining geolocation");
      geolocationButton.innerHTML = `⛔️ Error obtaining geolocation`;
      geolocationButton.classList.add("error");
    }
  );
} else {
  console.log("Geolocation is not supported");
}

// Fetch data from the API
async function fetchData() {
  try {
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${searchTerm}?key=H6KNHXDKZKQ965BSSY2G4SB8V`
    );
    const data = await response.json();
    currentWeather = data;
    updateUI();
  } catch (err) {
    console.error("Error:", err);
  }
}

// Event handlers

unitSelector.addEventListener("change", function (e) {
  selectedUnit = e.target.value;
  console.log(selectedUnit);
  updateUI();
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  searchTerm = document.querySelector("#search").value;
  await fetchData();
  document.querySelector("#search").value = "";
  document.querySelector("#search").blur();

  document
    .querySelector(".places__geolocation")
    .insertAdjacentHTML(
      "afterend",
      `<p class="places__item">${currentWeather.resolvedAddress}</p>`
    );
});

placesContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("error")) {
    console.log("Error: Geolocation not available");
    return;
  }
  if (
    e.target.classList.contains("places__item") ||
    e.target.classList.contains("places__geolocation")
  ) {
    searchTerm = e.target.innerText;
    fetchData();
  }
});

// geolocationButton.addEventListener("click", () => {
//   searchTerm = geolocationAddress;
//   fetchData();
// });
