//* This function gets the coordinates of the user's current position.
async function getCoordinateData(latitude, longitude) {
    try {
        const coordinateData = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`);
        const coordinateResult = await coordinateData.json();
        //console.log(locationResult);

        return coordinateResult;
    }
    catch (error) {
        //console.log(error);
    }
}

//* This function reverse searches the user's coordinates to get the location details.
async function getLocationName(latitude, longitude) {
    try {
        const locationNameData = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const locationNameResult = await locationNameData.json();
        //console.log(locationNameResult);

        return locationNameResult;
    }
    catch (error) {
        //console.log(error);
    }
}

//* This function gets all the weather data based on the latitiude and longitude of the user's location.
async function getWeatherData(latitude, longitude) {
    try {
        //https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,moonrise,moonset,moon_phase,rain_sum,showers_sum,wind_speed_10m_max,wind_gusts_10m_max&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,rain,showers,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_80m,uv_index&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,showers,precipitation,rain,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto&past_days=1
        const weatherData = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,temperature_2m,apparent_temperature,is_day&hourly=temperature_2m,cloud_cover,uv_index,weather_code,relative_humidity_2m,apparent_temperature,rain,showers,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day&timezone=auto&past_days=1&forecast_days=7&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,moonrise,moonset,moon_phase`);
        const weatherDataResult = await weatherData.json();

        return weatherDataResult;
    }
    catch (error) {
        //console.log(error);
    }
}

async function loadWeather(latitude, longitude) {
    const locationData = await getLocationName(latitude, longitude);
    const weatherInfo = await getWeatherData(latitude, longitude);

    //console.log(coordinateData);
    //console.log(locationData);
    //console.log(weatherInfo);

    const time = new Date();
    const currentHour = time.getHours();
    //console.log(currentHour);

    //* Sends the location state and country to the function to be displayed in HTML.
    displayLocation(locationData.address.state, locationData.address.town, locationData.address.country);

    //* Gets the current hour as an index to match the API
    const now = new Date();
    const hour = now.getHours();
    const index = 24 + hour; // Current hour within 8 days

    const currTemp = Math.round(weatherInfo.current.temperature_2m);
    const feelsLikeTemp = Math.round(weatherInfo.current.apparent_temperature);
    const tempUnits = weatherInfo.hourly_units.temperature_2m

    const maxTemp = Math.round(weatherInfo.daily.temperature_2m_max[1]);
    const minTemp = Math.round(weatherInfo.daily.temperature_2m_min[1]);

    //console.log("Max: " + maxTemp);
    //console.log("Min: " + minTemp);

    const fullDayForecast = weatherInfo.hourly.temperature_2m;
    const weatherCode = weatherInfo.hourly.weather_code;
    const miniFullDayForecast = weatherInfo.hourly;
    const currentWeatherCode = weatherInfo.current.weather_code;

    //* Sends the current, max and min temperatures to be displayed, as well as the units.
    //* Addition: now sends the weather codes, the current hour as a 24hr time value, the hourly weather info arry and the index
    //* which is the current hour within 8 days.
    displayTemperatures(currTemp, maxTemp, minTemp, feelsLikeTemp, tempUnits, currentHour, miniFullDayForecast, index, currentWeatherCode);

    //* Sends the 24-hour forecast temperatures, the weather code for every hour,
    //* the current hour as an index and the current hour as a time value.
    display24HrForecast(fullDayForecast, index, currentHour, weatherCode);

    const sunriseInfo = weatherInfo.daily.sunrise;
    const sunsetInfo = weatherInfo.daily.sunset;
    const moonriseInfo = weatherInfo.daily.moonrise;
    const moonsetInfo = weatherInfo.daily.moonset;
    const moonphaseInfo = weatherInfo.daily.moon_phase;

    //* Sends the sunrise and sunset times to be displayed.
    displaySunInfo(sunriseInfo, sunsetInfo);
    displayMoonInfo(moonriseInfo, moonsetInfo, moonphaseInfo);

    //* Allows the user to open the weather details of each hour.
    openWeatherDetails(miniFullDayForecast, fullDayForecast);


    const dailyInfo = weatherInfo.daily;
    //* Gets the data for the 7-day forecast.
    const dailyHumidity = getDailyDetails(miniFullDayForecast, dailyInfo);

    //* Displays the 7-day forecast.
    displaySevenDayForecast(dailyHumidity);
}

document.addEventListener("DOMContentLoaded", () => {
    const welcome = document.getElementById("welcome");
    const greet = document.getElementById("greet");
    const welcomeTime = document.getElementById("welcome-time");
    const asifWatermark = document.getElementById("watermark");
    const themeColor = document.getElementById("theme-color");

    //? Hide the search results right away.
    searchResults.classList.add("hide");

    //* Changes theme based on the time of day.
    const time = new Date();
    const currentHour = time.getHours();
    //console.log(currentHour);

    if (currentHour >= 0 && currentHour <= 11) {
        greet.textContent = "Good Morning!";
    }
    else if (currentHour >= 12 && currentHour <= 15) {
        greet.textContent = "Good Afternoon!"
    }
    else if (currentHour >= 16 && currentHour <= 19) {
        greet.textContent = "Good Evening!"
        asifWatermark.src = "/images/Asif_Watermark_OrangeRed.png";
    }
    else {
        greet.textContent = "Good Night!"
    }

    //* Displays the current time upon initialisation.
    const t1 = new Date();
    welcomeTime.textContent = t1.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    })

    //* Decides which mode is on
    if (currentHour <= 5 || currentHour >= 20) {
        //console.log("working")
        document.body.classList.toggle("darkmode");
    }
    else if (currentHour >= 16 && currentHour <= 19) {
        document.body.classList.toggle("eveningmode");
    }

    //? For the theme switch (button).
    // const darkBtn = document.getElementById("switch");
    // darkBtn.addEventListener("click", () =>{
    //     document.body.classList.toggle("eveningmode");
    // })

    //* Changes the browser theme based on the theme of the site.
    if (document.body.classList.contains("eveningmode")) {
        themeColor.content = "#f8794b";
    }
    else if (document.body.classList.contains("darkmode")) {
        themeColor.content = "#103163";
    }
    else {
        themeColor.content = "#2d55db";
    }

    //console.log("DOM loaded");

    //* Enables the search feature.
    search();

    navigator.geolocation.getCurrentPosition(async (position) => {
        //* Gets the latitude and longitude of the current position/location.
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        //console.log(latitude);
        //console.log(longitude);

        //* Loads all information.
        await loadWeather(latitude, longitude)

        //* Hides the welcome screen.
        welcome.classList.add("hide");

        setTimeout(() => {
            welcome.style.display = "none";
        }, 2000);
    },
        (error) => {
            //console.log("Couldn't get location: " + error.code + " " + error.message);

            if (error.code === 1) {
                document.getElementById("loc-name").textContent = "Please enable location access and refresh the page.";
                document.getElementById("loc-name").style.fontSize = "15px";
                document.getElementById("loc-info-con").style.backgroundColor = "#ff3535c7";
                document.getElementById("loc-info-con").style.boxShadow = "0px 0px 10px #ff3535";
            }
            else if (error.code === 2) {
                document.getElementById("loc-name").textContent = "Unable to determine your location.";
            }
            else if (error.code === 3) {
                document.getElementById("loc-name").textContent = "Location request timed out.";
                setTimeout(() => {
                    location.reload()
                }, 3000);
            }
        },
        {
            timeout: 10000,
            maximumAge: 300000,
            enableHighAccuracy: true
        }
    )
})

//* This function displays the user's current or searched location.
function displayLocation(state, town, country) {
    const locationName = document.getElementById("loc-name");

    if (state === undefined && town === undefined) {
        locationName.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#00bfff" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
            </svg>
            ${country}
        `;
    }
    else if (state === town || town === undefined) {
        locationName.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#00bfff" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
            </svg>
            ${state}, ${country}
        `;
    }
    else if (state === undefined) {
        locationName.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#00bfff" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
            </svg>
            ${town}, ${country}
        `;
    }
    else {
        locationName.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#00bfff" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
            </svg>
            ${town}, ${state}, ${country}
        `;
    }
}

//? A list of cardinal points - used for wind direction.
const directions = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW"
];


// * This function takes the current, min and max temperatures as well as the units and displays it in HTML.
//* Addition: now takes in the weather codes and the current hour to display the weather description.
//* Addition: now takes in the current hour (24hr time value), hourly weather info array and index (current hour in 8 days).
function displayTemperatures(currentTemperature, max, min, feelsLike, tempUnits, currentHour, miniFullDayForecast, index, currWeatherCode) {
    const currentTemp = document.getElementById("current-temp");
    const maxTempCon = document.getElementById("max-temp");
    const minTempCon = document.getElementById("min-temp");
    const feelsLikeCon = document.getElementById("feels-like-temp");
    const tempDes = document.getElementById("curr-temp-des");

    tempDes.textContent = weatherIcons[currWeatherCode].UIDescription;

    let timeUnit;

    //* Determines if the time is am or pm.
    if (currentHour >= 12)
        timeUnit = "pm";
    else
        timeUnit = "am";

    //* Determines what icon is displayed based on day or night.
    let icon;

    if (currentHour >= 6 && currentHour < 18) {
        icon = weatherIcons[currWeatherCode].day;
    }
    else {
        icon = weatherIcons[currWeatherCode].night;
    }

    //* Adds all data in their appropriate locations.
    currentTemp.innerHTML = `
        <img class="curr-temp-icon" src="/SVGs/animated/${icon}">
        <span class="current-temp">${Math.floor(currentTemperature)}</span>
        <span class="temp-units">${tempUnits}</span>
    `
    //console.log(weatherIcons[currWeatherCode].day);

    maxTempCon.innerHTML = `
        <span class="max-temp">${Math.floor(max)}</span>
        <span class="temp-units">${tempUnits}</span>
    `

    minTempCon.innerHTML = `
        <span class="min-temp">${Math.floor(min)}</span>
        <span class="temp-units">${tempUnits}</span>
    `

    feelsLikeCon.innerHTML = `
        <span class="feels-like-temp">${Math.floor(feelsLike)}</span>
        <span class="temp-units" style="color: whitesmoke">${tempUnits}</span>
    `

    //! Display Current Weather Details
    const currTempCon = document.getElementById("curr-temp-con");
    const forecastPopupCon = document.getElementById("forecast-popup");
    const popupTime = document.getElementById("popup-time");
    const popupTemp = document.getElementById("popup-temp");
    const popupIcon = document.getElementById("popup-icon");
    const miniCons = document.getElementById("mini-containers");

    //? Converts to 12 hour format
    let twelvHr;
    if (currentHour > 12) {
        twelvHr = currentHour - 12;
    }
    else if (currentHour === 0) {
        twelvHr = 12;
    }
    else {
        twelvHr = currentHour;
    }

    currTempCon.addEventListener("click", () => {
        popupTime.textContent = twelvHr + timeUnit;
        popupTemp.textContent = currentTemperature + "°";
        popupIcon.src = `/SVGs/animated/${icon}`;

        const feelsLikeTemp = feelsLike;
        const windDirectionCardinal = directions[Math.round(miniFullDayForecast.wind_direction_10m[index] / 22.5) % 16];
        const windDirectionDegree = miniFullDayForecast.wind_direction_10m[index];
        const humidityPercent = miniFullDayForecast.relative_humidity_2m[index];
        const UVIndex = Math.round(miniFullDayForecast.uv_index[index]);
        const cloudCoverValue = miniFullDayForecast.cloud_cover[index];
        const rainAmt = miniFullDayForecast.rain[index];

        //* Determining cloud cover description.
        let cloudCoverDes;

        if (cloudCoverValue <= 10)
            cloudCoverDes = "Clear Skies";
        else if (cloudCoverValue <= 25)
            cloudCoverDes = "Mostly Clear";
        else if (cloudCoverValue <= 50)
            cloudCoverDes = "Partly Cloudy";
        else if (cloudCoverValue <= 75)
            cloudCoverDes = "Mostly Cloudy";
        else if (cloudCoverValue <= 90)
            cloudCoverDes = "Very Cloudy";
        else
            cloudCoverDes = "Overcast";

        //* Addding information to their appropriate location in the weather details.
        miniCons.innerHTML = `
                <div class="mini-feels-like mini-con">
                    <p class="cat-text">Feels Like</p>
                    <img src="/SVGs/animated/thermometer-glass-celsius.svg">
                    <p class="cat-text">${Math.floor(feelsLikeTemp)}°C</p>
                </div>
                    <div class="mini-wind-dir mini-con">
                    <p class="cat-text">Wind Direction</p>
                    <img src="/SVGs/animated/umbrella-wind.svg">
                    <p class="cat-text">${windDirectionDegree}° ${windDirectionCardinal}</p>
                </div>
                <div class="mini-humidity mini-con">
                    <p class="cat-text">Humidity</p>
                    <img src="/SVGs/animated/humidity.svg">
                    <p class="cat-text">${humidityPercent}%</p>
                </div>
                <div class="mini-uv-index mini-con">
                    <p class="cat-text">UV Index</p>
                    <img src="/SVGs/animated/uv-index.svg">
                    <p class="cat-text">${UVIndex}</p>
                </div>
                <div class="mini-cloud-cover mini-con">
                    <p class="cat-text">Cloud Cover</p>
                    <img src="/SVGs/animated/cloudy.svg">
                    <p class="cat-text">${cloudCoverValue}%<br>${cloudCoverDes}</p>
                </div>
                <div class="mini-rain-amt mini-con">
                    <p class="cat-text">Rain</p>
                    <img src="/SVGs/animated/raindrop-measure.svg">
                    <p class="cat-text">${rainAmt}mm</p>
                </div>
            `
        //? Allows the popup to be displayed.
        forecastPopupCon.classList.add("active");
    });
}

//* A list of the weather icons for the day and night, with their UI Description.
const weatherIcons = {
    0: {
        day: "clear-day.svg",
        night: "clear-night.svg",
        UIDescription: "Clear"
    },

    1: {
        day: "cloudy.svg",
        night: "cloudy.svg",
        UIDescription: "Mostly Cloudy"
    },

    2: {
        day: "partly-cloudy-day.svg",
        night: "partly-cloudy-night.svg",
        UIDescription: "Partly Cloudy"
    },

    3: {
        day: "overcast-day.svg",
        night: "overcast-night.svg",
        UIDescription: "Overcast"
    },

    45: {
        day: "fog-day.svg",
        night: "fog-night.svg",
        UIDescription: "Fog"
    },

    48: {
        day: "depositing-rime-fog-day.svg",
        night: "depositing-rime-fog-night.svg",
        UIDescription: "Despoiting Rime Fog"
    },

    51: {
        day: "light-drizzle-day.svg",
        night: "light-drizzle-night.svg",
        UIDescription: "Light Drizzle"
    },

    53: {
        day: "moderate-drizzle-day.svg",
        night: "moderate-drizzle-night.svg",
        UIDescription: "Moderate Drizzle"
    },

    55: {
        day: "heavy-drizzle-day.svg",
        night: "heavy-drizzle-night.svg",
        UIDescription: "Heavy Drizzle"
    },

    61: {
        day: "slight-rain-day.svg",
        night: "slight-rain-night.svg",
        UIDescription: "Light Rain"
    },

    63: {
        day: "moderate-rain-day.svg",
        night: "moderate-rain-night.svg",
        UIDescription: "Moderate Rain"
    },

    65: {
        day: "heavy-rain-day.svg",
        night: "heavy-rain-night.svg",
        UIDescription: "Heavy Rain"
    },

    66: {
        day: "slight-rain-day.svg",
        night: "slight-rain-night.svg",
        UIDescription: "Slight Freezing Rain"
    },

    67: {
        day: "heavy-rain-day.svg",
        night: "heavy-rain-night.svg",
        UIDescription: "Heavy Freezing Rain"
    },

    71: {
        day: "light-snow-day.svg",
        night: "light-snow-night.svg",
        UIDescription: "Light Snow Fall"
    },

    73: {
        day: "moderate-snow-day.svg",
        night: "moderate-snow-night.svg",
        UIDescription: "Moderate Snow Fall"
    },

    75: {
        day: "heavy-snow-day.svg",
        night: "heavy-snow-night.svg",
        UIDescription: "Heavy Snow Fall"
    },

    77: {
        day: "snow-grains.svg",
        night: "snow-grains.svg",
        UIDescription: "Snow Grains"
    },


    80: {
        day: "slight-rain-day.svg",
        night: "slight-rain-night.svg",
        UIDescription: "Light Showers"
    },

    81: {
        day: "moderate-rain-day.svg",
        night: "moderate-rain-night.svg",
        UIDescription: "Rain Showers"
    },

    82: {
        day: "heavy-rain-day.svg",
        night: "heavy-rain-night.svg",
        UIDescription: "Heavy Rain"
    },

    85: {
        day: "light-snow-day.svg",
        night: "light-snow-night.svg",
        UIDescription: "Light Snow Showers"
    },

    86: {
        day: "heavy-snow-day.svg",
        night: "heavy-snow-night.svg",
        UIDescription: "Heavy Snow Showers"
    },

    95: {
        day: "thunder-storm-day.svg",
        night: "thunder-storm-night.svg",
        UIDescription: "Thunderstorm"
    },

    96: {
        day: "thunder-storm-slight-hail-day.svg",
        night: "thunder-storm-slight-hail-night.svg",
        UIDescription: "Slight Hail Associated Thunderstorms"
    },

    99: {
        day: "thunder-storm-heavy-hail-day.svg",
        night: "thunder-storm-heavy-hail-night.svg",
        UIDescription: "Heavy Hail Associated Thunderstorms"
    }
}

//* This function displays the 24-hour weather forecast.
function display24HrForecast(fullDayForecast, currentHourIndex, currentHourTime, weatherCodes) {
    const forecastCon = document.getElementById("forecast-con");

    //* Resets the container if the user searches another location.
    forecastCon.innerHTML = "";

    let next24 = currentHourIndex + 24; // Calculates the last hour index
    let time = currentHourTime + 1; // Calculates the next hour

    for (let i = currentHourIndex; i < next24; i++) {
        let hour = time % 24;
        let twelvHrTime;

        //* Calculates the time in 12-hours.
        if (hour === 0) {
            twelvHrTime = 12;
        }
        else if (hour > 12) {
            twelvHrTime = hour - 12;
        }
        else {
            twelvHrTime = hour
        }

        //* Determines if the time is in AM or PM.
        let timeUnit;
        if (hour >= 12) {
            timeUnit = "pm";
        }
        else {
            timeUnit = "am";
        }

        let temp = fullDayForecast[i];
        let code = weatherCodes[i];
        //console.log(code);
        let svg;

        if (weatherIcons[code]) {
            if (hour >= 6 && hour < 18) {
                svg = weatherIcons[code].day;
            }
            else {
                svg = weatherIcons[code].night;
            }

            //* Displays the HTML for each hour.
            forecastCon.innerHTML += `
                <div class="one-hour" data-hour-index="${i}" data-twelv-hr-time="${twelvHrTime}" data-time-unit="${timeUnit}" data-icon-svg="${svg}">
                    <p class="time">${twelvHrTime + timeUnit}</p>
                    <img class="icon" src="/SVGs/animated/${svg}">
                    <p class="temp">${Math.floor(temp)}°</p>
                    <p class="cat-text" style="font-size: 12px; color: lightgoldenrodyellow; margin-top: 8px;">Details</p>
                </div>
            `
        }
        else {
            console.warn("No icon for weather code: " + code);
            svg = "Asif_Watermark_Blue.png";

            //* Displays the HTML for each hour.
            forecastCon.innerHTML += `
                <div class="one-hour" data-hour-index="${i}" data-twelv-hr-time="${twelvHrTime}" data-time-unit="${timeUnit}" data-icon-svg="${svg}">
                    <p class="time">${twelvHrTime + timeUnit}</p>
                    <img class="icon" src="/images/${svg}">
                    <p class="temp">${Math.floor(temp)}°</p>
                    <p class="cat-text" style="font-size: 12px; color: lightgoldenrodyellow; margin-top: 8px;">Details</p>
                </div>
            `
        }

        //console.log(svg);
        time++;
    }
}


//* This function displays the sunset and sunrise times.
function displaySunInfo(sunriseInfo, sunsetInfo) {
    const sunriseTime = sunriseInfo[1];
    const sunsetTime = sunsetInfo[1];
    //console.log(sunriseTime);
    //console.log(sunsetTime);

    const sunriseTime12Hr = new Date(sunriseTime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    const sunsetTime12Hr = new Date(sunsetTime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    })

    const sunriseTimeCon = document.getElementById("sunrise-time");
    const sunsetTimeCon = document.getElementById("sunset-time");

    sunriseTimeCon.textContent = sunriseTime12Hr;
    sunsetTimeCon.textContent = sunsetTime12Hr;
}

//* This function displays the moonset and moonrise info, as well the the moonphase info.
function displayMoonInfo(moonriseInfo, moonsetInfo, moonphaseInfo) {
    const moonriseTime = moonriseInfo[1];
    const moonsetTime = moonsetInfo[1];

    const moonriseTime12Hr = new Date(moonriseTime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    })

    const moonsetTime12Hr = new Date(moonsetTime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    })

    const moonriseTimeCon = document.getElementById("moonrise-time");
    const moonsetTimeCon = document.getElementById("moonset-time");

    moonriseTimeCon.textContent = moonriseTime12Hr;
    moonsetTimeCon.textContent = moonsetTime12Hr;

    const moonphaseText = document.getElementById("moonphase");
    const moonphaseIcon = document.getElementById("moonphase-icon");
    const moonphaseNow = moonphaseInfo[1];

    //* Determines the current phase of the moon.
    if ((moonphaseNow === 0) || (moonphaseNow === 1)) {
        moonphaseText.textContent = "New Moon"
        moonphaseIcon.src = `/SVGs/animated/moon-new.svg`
    }
    else if ((moonphaseNow > 0) && (moonphaseNow < 0.25)) {
        moonphaseText.textContent = "Waxing Crescent"
        moonphaseIcon.src = `/SVGs/animated/moon-waxing-crescent.svg`
    }
    else if (moonphaseNow === 0.25) {
        moonphaseText.textContent = "First Quarter"
        moonphaseIcon.src = `/SVGs/animated/moon-first-quarter.svg`
    }
    else if ((moonphaseNow > 0.25) && (moonphaseNow < 0.5)) {
        moonphaseText.textContent = "Waxing Gibbous"
        moonphaseIcon.src = `/SVGs/animated/moon-waxing-gibbous.svg`
    }
    else if (moonphaseNow === 0.5) {
        moonphaseText.textContent = "Full Moon"
        moonphaseIcon.src = `/SVGs/animated/moon-full.svg`
    }
    else if ((moonphaseNow > 0.5) && (moonphaseNow < 0.75)) {
        moonphaseText.textContent = "Waning Gibbous"
        moonphaseIcon.src = `/SVGs/animated/moon-waning-gibbous.svg`
    }
    else if (moonphaseNow === 0.75) {
        moonphaseText.textContent = "Last Quarter"
        moonphaseIcon.src = `/SVGs/animated/moon-last-quarter.svg`
    }
    else if ((moonphaseNow > 0.75) && (moonphaseNow < 1)) {
        moonphaseText.textContent = "Waning Cresent"
        moonphaseIcon.src = `/SVGs/animated/moon-waning-crescent.svg`
    }
}

//* This function allows the user to open the weather details for any hour within the 24-hour forecast.
function openWeatherDetails(miniFullDayForecast, fullDayForecast) {
    const miniDetails = document.querySelectorAll(".one-hour");
    const forecastPopupCon = document.getElementById("forecast-popup");
    const exitBtn = document.getElementById("exit");

    //* Allows the user to close the popup.
    exitBtn.addEventListener("click", () => {
        forecastPopupCon.classList.remove("active");
    })

    const popupTime = document.getElementById("popup-time");
    const popupTemp = document.getElementById("popup-temp");
    const popupIcon = document.getElementById("popup-icon");
    const miniCons = document.getElementById("mini-containers");

    //console.log(miniDetails)
    //console.log(miniFullDayForecast);
    for (let i = 0; i < miniDetails.length; i++) {
        miniDetails[i].addEventListener("click", () => {
            const hourIndex = miniDetails[i].dataset.hourIndex;
            const twelvHrTime = miniDetails[i].dataset.twelvHrTime;
            const timeUnit = miniDetails[i].dataset.timeUnit;
            const svg = miniDetails[i].dataset.iconSvg;
            const feelsLike = miniFullDayForecast.apparent_temperature[hourIndex];
            const windDirectionCardinal = directions[Math.round(miniFullDayForecast.wind_direction_10m[hourIndex] / 22.5) % 16];
            const windDirectionDegree = miniFullDayForecast.wind_direction_10m[hourIndex];
            const humidityPercent = miniFullDayForecast.relative_humidity_2m[hourIndex];
            const UVIndex = Math.round(miniFullDayForecast.uv_index[hourIndex]);
            const cloudCoverValue = miniFullDayForecast.cloud_cover[hourIndex];
            const rainAmt = miniFullDayForecast.rain[hourIndex];

            //* Determins the cloud cover description.
            let cloudCoverDes;

            if (cloudCoverValue <= 10)
                cloudCoverDes = "Clear Skies";
            else if (cloudCoverValue <= 25)
                cloudCoverDes = "Mostly Clear";
            else if (cloudCoverValue <= 50)
                cloudCoverDes = "Partly Cloudy";
            else if (cloudCoverValue <= 75)
                cloudCoverDes = "Mostly Cloudy";
            else if (cloudCoverValue <= 90)
                cloudCoverDes = "Very Cloudy";
            else
                cloudCoverDes = "Overcast";

            //console.log(feelsLike);
            //console.log(hourIndex);
            //console.log(twelvHrTime);

            popupTime.textContent = twelvHrTime + "" + timeUnit;
            popupTemp.textContent = Math.floor(fullDayForecast[hourIndex]) + "°";
            popupIcon.src = `/SVGs/animated/${svg}`;

            //* Displays the information in the appropriate locations.
            miniCons.innerHTML = `
                <div class="mini-feels-like mini-con">
                    <p class="cat-text">Feels Like</p>
                    <img src="/SVGs/animated/thermometer-glass-celsius.svg">
                    <p class="cat-text">${Math.floor(feelsLike)}°C</p>
                </div>
                    <div class="mini-wind-dir mini-con">
                    <p class="cat-text">Wind Direction</p>
                    <img src="/SVGs/animated/umbrella-wind.svg">
                    <p class="cat-text">${windDirectionDegree}° ${windDirectionCardinal}</p>
                </div>
                <div class="mini-humidity mini-con">
                    <p class="cat-text">Humidity</p>
                    <img src="/SVGs/animated/humidity.svg">
                    <p class="cat-text">${humidityPercent}%</p>
                </div>
                <div class="mini-uv-index mini-con">
                    <p class="cat-text">UV Index</p>
                    <img src="/SVGs/animated/uv-index.svg">
                    <p class="cat-text">${UVIndex}</p>
                </div>
                <div class="mini-cloud-cover mini-con">
                    <p class="cat-text">Cloud Cover</p>
                    <img src="/SVGs/animated/cloudy.svg">
                    <p class="cat-text">${cloudCoverValue}%<br>${cloudCoverDes}</p>
                </div>
                <div class="mini-rain-amt mini-con">
                    <p class="cat-text">Rain</p>
                    <img src="/SVGs/animated/raindrop-measure.svg">
                    <p class="cat-text">${rainAmt}mm</p>
                </div>
            `
            //? Allows the popup to be displayed.
            forecastPopupCon.classList.add("active");
        })
    }
}

//* This function displays the 7-day forecast with all it's information.
function displaySevenDayForecast(dailyHumidity) {
    //console.log(dailyHumidity);

    const humidityValues = dailyHumidity.humidityResults;
    const maxTempValues = dailyHumidity.dailyMaxTempResults;
    const minTempValues = dailyHumidity.dailyMinTempResults;
    const maxWeatherCodes = dailyHumidity.maxWeatherCodeResults;
    const minWeatherCodes = dailyHumidity.minWeatherCodeResults;

    //? All days in the week.
    const days = [
        "Sun", "Mon", "Tue", "Wed",
        "Thu", "Fri", "Sat"
    ];

    const outlookCon = document.getElementById("outlook-con");

    //* Resets the container if the user searches a location.
    outlookCon.innerHTML = "";

    const now = new Date();
    const day = now.getDay();

    //console.log(day);

    for (let i = -1; i <= 5; i++) {

        const dayIndex = (day + i + 7) % 7;

        let dayName;

        if (i === 0)
            dayName = "Today";
        else
            dayName = days[dayIndex];

        //* Displays all the information in the appropriate location.
        outlookCon.innerHTML += `
            <div class="day-con">
                <p class="day">${dayName}</p>

                <span class="hum">
                    <img src="/SVGs/animated/humidity.svg">
                    <p class="humid">${Math.round(humidityValues[i + 1])}%</p>
                </span>

                <span>
                    <img width="50px" class="icon max" src="/SVGs/animated/${weatherIcons[maxWeatherCodes[i + 1]].day}">
                    <img width="50px" class="icon min" src="/SVGs/animated/${weatherIcons[minWeatherCodes[i + 1]].night}">
                </span>

                <span class="temps">
                    <p class="max-temp">${Math.round(maxTempValues[i + 1])}°</p>
                    <p class="min-temp">${Math.round(minTempValues[i + 1])}°</p>
                </span>
            </div>
        `
    }
}

//* This functions gets all the details for the 7-day forecast.
function getDailyDetails(miniFullDayForecast, dailyInfo) {
    //console.log(miniFullDayForecast)

    //? The starting and ending indexs for each day based on the APIs array.
    const days = {
        day1: {
            start: 0,
            end: 23
        },

        day2: {
            start: 24,
            end: 47
        },

        day3: {
            start: 48,
            end: 71
        },

        day4: {
            start: 72,
            end: 95
        },

        day5: {
            start: 96,
            end: 119
        },

        day6: {
            start: 120,
            end: 143
        },

        day7: {
            start: 144,
            end: 167
        }
    }

    let dailyHumidity;
    let avgHum = 0;
    let humidityResults = [];
    let dailyMaxTempResults = [];
    let dailyMinTempResults = [];
    let maxWeatherCodeResults = [];
    let minWeatherCodeResults = [];

    for (let a = 1; a <= 7; a++) {
        let totalHum = 0;
        let maxIndex = days[`day${a}`].start;
        let maxTemp = miniFullDayForecast.temperature_2m[maxIndex];

        let minIndex = days[`day${a}`].start;
        let minTemp = miniFullDayForecast.temperature_2m[minIndex];

        for (let i = days[`day${a}`].start; i <= days[`day${a}`].end; i++) {
            //* Gets the total humidity for each day.
            totalHum = miniFullDayForecast.relative_humidity_2m[i] + totalHum;

            //* Gets the maximum and minimum temperature for each day.
            if (miniFullDayForecast.temperature_2m[i] > maxTemp) {
                maxTemp = miniFullDayForecast.temperature_2m[i];
                maxIndex = i;
            }

            if (miniFullDayForecast.temperature_2m[i] < minTemp) {
                minTemp = miniFullDayForecast.temperature_2m[i];
                minIndex = i;
            }
        }

        const maxWeatherCode = miniFullDayForecast.weather_code[maxIndex];
        const minWeatherCode = miniFullDayForecast.weather_code[minIndex];
        maxWeatherCodeResults.push(maxWeatherCode);
        minWeatherCodeResults.push(minWeatherCode);
        //console.log(maxWeatherCodeResults);

        //* Calculates the average humidity for each day.
        dailyHumidity = totalHum;
        avgHum = dailyHumidity / 24;
        humidityResults.push(avgHum);
        //console.log(`Day ${a} Humidity: ` + avgHum);

        dailyMaxTempResults.push(dailyInfo.temperature_2m_max[a])
        dailyMinTempResults.push(dailyInfo.temperature_2m_min[a])
    }

    return { humidityResults, dailyMaxTempResults, dailyMinTempResults, maxWeatherCodeResults, minWeatherCodeResults };
}

const searchBar = document.getElementById("search");
const searchIcon = document.getElementById("search-label");
const searchResults = document.getElementById("search-results");
const cancelSearch = document.getElementById("cancel");

//* This function allows the search bar to be functional.
function search() {
    searchIcon.addEventListener("click", () => {
        const location = searchBar.value;

        if (location === "") {
            searchBar.value = "Enter a Location"
            return;
        }
        searchLocation(location);
    })

    searchBar.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const location = searchBar.value;
            //console.log(location);

            if (location === "") {
                searchBar.value = "Enter a Location"
                return;
            }

            searchLocation(location);
        }
    })
}

//* This function allows the user to enter a location and returns all the weather details for that location.
async function searchLocation(location) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0) {
        //console.log("No locations found.");
        searchBar.value = "No Locations Found"

        setTimeout(() => {
            searchBar.value = "";
        }, 3000);

        return;
    }

    searchResults.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        const result = data[i];
        const resultElement = document.createElement("div");

        searchResults.classList.remove("hide");
        resultElement.textContent = result.display_name;

        searchIcon.style.display = "none";
        cancelSearch.style.display = "block";

        resultElement.addEventListener("click", () => {
            const lat = result.lat;
            const lon = result.lon;

            searchBar.value = result.name;
            searchResults.classList.add("hide");

            //console.log(lat);
            //console.log(lon);

            loadWeather(lat, lon);
            cancelSearch.style.display = "none";
            searchIcon.style.display = "";
        })

        searchResults.appendChild(resultElement);
    }

    //console.log(data);

    cancelSearch.addEventListener("click", () => {
        searchResults.classList.add("hide");
        searchIcon.style.display = "";
        cancelSearch.style.display = "none";
    })
}