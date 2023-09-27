const API_KEY = "8c588bd38cd5759e60b78f2c62205642";

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


let latitude = "";
let longitude = "";
let city = "";
let country = "";
let unit = "kelvin";
let weather = {};

const findCurrentLocation = () => {
    console.log('Finding current location');
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
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
        }), (err) => {
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    alert('User Denied the request for geolocation');
                    break;
                case err.POSITION_UNAVAILABLE:
                    alert('Location information is unavailable');
                    break;
                case err.TIMEOUT:
                    alert('The request to get user location timed out.');
                    break;
                default:
                    alert('An unknown error occurred');
            }
        }
    }
    else {
        alert('Geolocation is not supported in this browser');
    }
}


window.addEventListener('load', findCurrentLocation);
locationBtn.addEventListener('click', findCurrentLocation);
selectInput.addEventListener('change', (e) => {
    unit = e.target.value;
    updateWeatherReport(weather);
})

async function getGeoCordinates(city) {
    const resposnse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`);
    const data = await resposnse.json();
    return data;
}

async function getWeatherData(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const data = await response.json();
    return data;
}

async function findPlace(lat, lon) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    return data;
}

function updateWeatherReport(weather) {
    if(unit == 'kelvin'){
        temperature.innerText = Math.round(weather.temperature);
        feelsLike.innerText = weather.feelsLike;
        unitContainer.innerText = "K";
        feelsLikeUnit.innerText = "K";
    }
    else if(unit == 'farhenite'){
        let kelvinTemp = weather.temperature;
        let farheniteTemp = 1.8*(kelvinTemp-273.15)+32;
        let feelsLikeTemp = weather.feelsLike;
        let farheniteFeelsLike =  1.8*(feelsLikeTemp-273.15)+32;
        feelsLike.innerText = farheniteFeelsLike.toFixed(2);
        feelsLikeUnit.innerText = "F";
        temperature.innerText = Math.round(farheniteTemp);
        unitContainer.innerText = "F";
    }
    else{
        let kelvinTemp = weather.temperature;
        let celciusTemp = Math.round(kelvinTemp - 273.15);
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

let searchKeyWord = "";

searchInput.addEventListener('change', (e) => {
    searchKeyWord = e.target.value;
})

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (searchKeyWord.length == 0) {
        alert('Enter a valid city name.');
        return;
    }
    getGeoCordinates(searchKeyWord).then((data) => {
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
})

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