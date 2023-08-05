const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer = document.querySelector(".error-container");

// initial variables need
let oldTab = userTab;
const API_KEY = "a324378e99550b9cb203d178bf7b33de";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if (newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            // kya search form wala container is invisible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            // main pehle search vale tab par tha , ab your weather tab visible karna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // ab me weather tab me aagaya hu, toh weather bhi display karna padega
            // so see for coordinates stored in local storage
            getfromSessionStorage();
        }
    }
}


userTab.addEventListener("click", () => {
    // pass clicked tab as input
    switchTab(userTab);
});


searchTab.addEventListener("click", () => {
    // pass clicked tab as input
    switchTab(searchTab);
});

// check if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        // agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    // make grant access container invisible
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");

    // API CALL
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        // remove loader
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        // render the data on UI

        renderWeatherInfo(data);
    }
    catch (err) {
        // hndle the error
        loadingScreen.classList.remove("active");
    }
}

function renderWeatherInfo(weatherInfo) {
    // firstly, we hae to fetch all the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherinfo and put in UI elements 
    cityName.innerHTML = weatherInfo?.name;

    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    desc.innerText = weatherInfo?.weather?.[0]?.description;

    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

    temp.innerText = `${weatherInfo?.main?.temp} °C`;

    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;

    humidity.innerText = `${weatherInfo?.main?.humidity}%`;

    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        // hw alert for no such location
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));

    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if (cityName === "") {
        return;
    }
    else {
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        if (response.ok) {
            const data = await response.json();
            // remove loader
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            // Handle error when location not found
            loadingScreen.classList.remove("active");
            errorContainer.classList.add("active");

        }

    }
    catch (err) {
        // handle error
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
    }
}