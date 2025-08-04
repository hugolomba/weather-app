"use strict";

const form = document.querySelector("form");
const weatherContainer = document.querySelector(".weather-container");
const mainInfoContainer = document.querySelector(".main__info");
const mainForecastContainer = document.querySelector(".main__forecast");
const placesContainer = document.querySelector(".places__container");
const geolocationButton = document.querySelector(".places__geolocation");
const sidebarContainer = document.querySelector(".sidebar__container");
const mainContainer = document.querySelector(".main__container");

let mainForecastCardContainer = document.querySelector(
  ".forecast__card--container"
);
let unitSelector = document.querySelector("#unit-selector");
const today = new Date();

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

// Function to change selected classes
const changeSelectedClasses = (e) => {
  placesContainer.querySelectorAll(".place--selected").forEach((el) => {
    el.classList.remove("place--selected");
  });

  e.target.classList.add("place--selected");
};

// function to convert date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: "short", day: "numeric" };
  const formatted = date.toLocaleDateString("en-GB", options);

  return formatted; // Ex: "Mon 4"
}

function updateUI() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: currentWeather.timezone,
  };
  let weatherCard = `
  
  <p>${new Date().toLocaleString("en-GB", options)}</p>
    <div class="main__info--icon-container">



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
              )}<sup>°${selectedUnit}</sup></p>
          </div>
          <p class="main__info--city">${currentWeather.resolvedAddress}</p>
          <div>
      

          <p class="main__info--conditions">${
            currentWeather.currentConditions.conditions
          }</p>
          </div>
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
                    return `<p class="main__info--alert">Weather Alert: ${e.event} </p>`;
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
                
             
            </div> 
`;
    mainForecastCardContainer.insertAdjacentHTML("beforeend", forecastCard);
  });
}

// Get the current geolocation
const getGeolocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await res.json();
        geolocation = data;
        geolocationAddress = `${geolocation.address.suburb}, ${geolocation.address.city}, ${geolocation.address.country}`;
        geolocationButton.innerHTML = `📍 ${geolocationAddress}`;
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
};

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

// mainInfoContainer.addEventListener("click", (e) => {
//   console.log("Clicked on main info container", e.target.id);
//   unitSelector = document.querySelector("#unit-selector");
//   if (e.target.id === "unit-selector") {
//     selectedUnit = unitSelector.checked ? "F" : "C";

//     console.log(unitSelector.checked);
//     console.log(e.target.value);

//     updateUI();
//   }
// });

// mainInfoContainer.addEventListener("change", (e) => {
//   if (e.target.matches("#unit-selector")) {
//     selectedUnit = e.target.checked ? "F" : "C";
//     updateUI();
//   }
// });

unitSelector?.addEventListener("change", function (e) {
  selectedUnit = unitSelector.checked ? "F" : "C";

  console.log(unitSelector.checked);
  console.log(e.target.value);

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

  const allItems = document.querySelectorAll(".places__item");
  const newItem = allItems[0];
  changeSelectedClasses({ target: newItem });

  weatherContainer.classList.remove("hidden");
  mainInfoContainer.classList.remove("hidden");
  mainForecastContainer.classList.remove("hidden");
  sidebarContainer.classList.add("mobile--hidden");
});

placesContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("error")) {
    console.log("Error: Geolocation not available");
    return;
  }

  if (e.target.classList.contains("places__geolocation")) {
    if (!geolocationAddress) {
      getGeolocation();
      return;
    }
  }

  if (
    e.target.classList.contains("places__item") ||
    e.target.classList.contains("places__geolocation")
  ) {
    searchTerm = e.target.innerText;

    changeSelectedClasses(e);

    console.log(e.target);

    fetchData();
    weatherContainer.classList.remove("hidden");
    mainInfoContainer.classList.remove("hidden");
    mainForecastContainer.classList.remove("hidden");
    sidebarContainer.classList.add("mobile--hidden");
  }
});

// geolocationButton.addEventListener("click", () => {
//   searchTerm = geolocationAddress;
//   fetchData();
// });

// mainContainer.addEventListener("change", (e) => {
//   if (e.target.matches("#unit-selector")) {
//     selectedUnit = e.target.checked ? "F" : "C";
//     updateUI();
//   }
// });
