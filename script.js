const API_KEY = "8c588bd38cd5759e60b78f2c62205642";  // My api key from Open Weather APIs

// Mapping images and icon code given in api response 
const ImageMapping = {
    "01d": "images/clear-sky.png",
    "01n": "images/clear-night.png",
    "02d": "images/few-clouds.png",
    "02n": "images/night-cloud.png",
    "03d": "images/scattered-clouds.png",
    "03n": "images/scattered-clouds.png",
    "04d": "images/scattered-clouds.png",
    "04n": "images/scattered-clouds.png",
    "09d": "images/shower-rain.png",
    "09n": "images/shower-rain.png",
    "10d": "images/heavy-rain.png",
    "10n": "images/rainy-night.png",
    "11d": "images/thunderstorms.png",
    "11n": "images/thunderstorm-night.png",
    "13d": "images/snow.png",
    "13n": "images/snow-night.png",
    "50d": "images/mist.png",
    "50n": "images/mist-night.png"
}


//Storing html elements in variables
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const temperature = document.querySelector('.temp-value');
const unitContainer = document.querySelector('.unit');
const feelsLike = document.querySelector('.feels-like-value');
const feelsLikeUnit = document.querySelector('.feels-like-unit');
const humidity = document.querySelector('.humidity-value');
const windSpeed = document.querySelector('.wind-speed-value');
const weatherImage = document.querySelector('#weather-img');
const description = document.querySelector('.description-details');
const locationContainer = document.querySelector('.location-details');
const locationBtn = document.querySelector('.location-btn');
const day = document.querySelector('.day');
const date = document.querySelector('.date');
const selectInput = document.querySelector('#select-unit');


//Declaring global variables
let searchKeyWord = "";
let latitude = "";
let longitude = "";
let city = "";
let country = "";
let unit = "kelvin";
let weather = {};

//Function for finding latitude and longitude from city name
async function getGeoCordinates(city) {
    const resposnse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`);
    const data = await resposnse.json();
    return data;
}

//Function for finding weather of given latitude and longitude position
async function getWeatherData(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const data = await response.json();
    return data;
}

//Function for finding city with given latitude and longitude
async function findPlace(lat, lon) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    return data;
}

//Function for finding weather details for given city name
function findWeatherByCity(city) {
    getGeoCordinates(city).then((data) => {
        if (data.length == 0) {
            alert('Enter a valid city name.');
            return;
        }
        latitude = data[0].lat;
        longitude = data[0].lon;
        const country = data[0].country;
        const name = data[0].name;
        const state = data[0].state;
        getWeatherData(latitude, longitude).then((data) => {
            weather = {
                temperature: data.main.temp,
                feelsLike: data.main.feels_like,
                humidity: data.main.humidity,
                description: data.weather[0].description,
                windSpeed: data.wind.speed,
                iconId: data.weather[0].icon,
                location: {
                    name: name,
                    state: state,
                    country: country
                }
            }
            updateWeatherReport(weather);
        }).catch((err) => {
            alert(err.message);
        });
    }).catch((err) => {
        alert(err.message);
    });
}

//Function for finding weather details at given latitude and longitude
function findWeatherByCoordinates(latitude, longitude){
    findPlace(latitude, longitude).then((data) => {
        city = data.address.city;
        country = data.address.country_code;
        getWeatherData(latitude, longitude).then((data) => {
            weather = {
                temperature: data.main.temp,
                feelsLike: data.main.feels_like,
                humidity: data.main.humidity,
                description: data.weather[0].description,
                windSpeed: data.wind.speed,
                iconId: data.weather[0].icon,
                location: {
                    name: city,
                    country: country
                }
            }
            updateWeatherReport(weather);
        }).catch((err) => {
            alert(err.message);
        })
    }).catch((err) => {
        alert(err.message);
    })
}

//Function for finding current location of device
const findCurrentLocation = () => {
    if ("geolocation" in navigator) {    //Asking for geolocation permission
        navigator.geolocation.getCurrentPosition((position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            findWeatherByCoordinates(latitude, longitude);
        }, (err) => {
            switch (err.code) {
                case err.PERMISSION_DENIED: //If permission denied by user
                    alert('User Denied the request for geolocation. for getting current location weather allow for accessing location permission!!');
                    searchKeyWord = "Mumbai";
                    findWeather(searchKeyWord);
                    break;
                case err.POSITION_UNAVAILABLE: //If the position of the device is unavailable
                    alert('Location information is unavailable');
                    break;
                case err.TIMEOUT:
                    alert('The request to get user location timed out.');
                    break;
                default: //Default message for unknown error
                    alert('An unknown error occurred');
            }
        }
        )
    }
    else {
        alert('Geolocation is not supported in this browser');
    }
}

//Function for updating the weather details card
function updateWeatherReport(weather) {
    if (unit == 'kelvin') {
        temperature.innerText = Math.round(weather.temperature);
        feelsLike.innerText = weather.feelsLike;
        unitContainer.innerText = "K";
        feelsLikeUnit.innerText = "K";
    }
    else if (unit == 'farhenite') {
        let kelvinTemp = weather.temperature;
        let farheniteTemp = 1.8 * (kelvinTemp - 273.15) + 32; //Converting kelvin temperature to farhenite temperature
        let feelsLikeTemp = weather.feelsLike;
        let farheniteFeelsLike = 1.8 * (feelsLikeTemp - 273.15) + 32;
        feelsLike.innerText = farheniteFeelsLike.toFixed(2);
        feelsLikeUnit.innerText = "F";
        temperature.innerText = Math.round(farheniteTemp);
        unitContainer.innerText = "F";
    }
    else {
        let kelvinTemp = weather.temperature;
        let celciusTemp = Math.round(kelvinTemp - 273.15); //converting kelvin temperature to celcius temperature
        let feelsLikeTemp = weather.feelsLike;
        let celciusFeelsLike = feelsLikeTemp - 273.15;
        feelsLike.innerText = celciusFeelsLike.toFixed(2);
        feelsLikeUnit.innerText = "C";
        temperature.innerText = Math.round(celciusTemp);
        unitContainer.innerText = "C";
    }
    humidity.innerText = weather.humidity;
    description.innerText = weather.description;
    windSpeed.innerHTML = `${weather.windSpeed} <span>M/S</span>`;
    weatherImage.src = ImageMapping[weather.iconId];
    locationContainer.innerText = `${weather.location.name}, ${weather.location.country}`;
    const currentDate = new Date();
    const dateVal = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth()).padStart(2, '0')}-${currentDate.getFullYear()}`;
    const dayOptions = { weekday: 'long' };
    const dayVal = currentDate.toLocaleDateString(undefined, dayOptions);
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const time = currentDate.toLocaleTimeString(undefined, timeOptions);

    day.innerHTML = `${dayVal} <span class="time">${time}</span>`;
    date.innerText = `${dateVal}`;
}

//Adding event listener to window for onload event
window.addEventListener('load', findCurrentLocation);

//Adding event listener to locationBtn for onclick event
locationBtn.addEventListener('click', findCurrentLocation);


//Adding event listener to selectInput for onchange event
selectInput.addEventListener('change', (e) => {
    unit = e.target.value;
    updateWeatherReport(weather);
})

//Adding event listener to searchInput for onchange event
searchInput.addEventListener('change', (e) => {
    searchKeyWord = e.target.value;
})

//Adding event listener to searchBtn for onclick event
searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (searchKeyWord.length == 0) {
        alert('Enter a valid city name.');
        return;
    }
    findWeatherByCity(searchKeyWord);
})

