$("body").delegate("#searchBtn", "click", function (e) {
  e.preventDefault();
  var keyword = $("#keyword").val();
  if (keyword == "" || keyword == null) {
    return;
  } else {
    getForecast(keyword);
  }
  $("#history").html("");
});


$(document).ready(function () {
  renderPreviousHistory();
  renderFirstSearch();
});
function renderFirstSearch() {
  if (localStorage.getItem("history") != null) {
    firstSearch = JSON.parse(localStorage.getItem("history"))[0];
    getForecast(firstSearch);
  }
}

function getForecast(cityName) {
  //add search to the history in localstorage
  var searchHistory = JSON.parse(localStorage.getItem("history")) || [];
  var cityNameFormatted = cityName[0].toUpperCase() + cityName.slice(1);
  console.log(cityNameFormatted);

  if (!searchHistory.includes(cityNameFormatted)) {
    searchHistory.push(cityName);
  }

  localStorage.setItem("history", JSON.stringify(searchHistory));

  var city = cityName.trim();
  var baseUrl =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&appid=93b5bdfd69192642a6f09c021ceb5113";

  //query to openweather api to get coordinates of city
  $.ajax({
    url: baseUrl,
    method: "GET",
  }).then(function (response) {
    //obtain coordinates of city from first ajax query
    var lat = response.city.coord["lat"];
    var lon = response.city.coord["lon"];

    var baseUrl =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&units=imperial&exclude=hourly,minutely,alert&appid=93b5bdfd69192642a6f09c021ceb5113";

    //second ajax query to openweather to obtain weather
    $.ajax({
      url: baseUrl,
      method: "GET",

      //dynamically build html for given city
    }).then(function (response) {
      var date = new Date(response.current.dt * 1000);

      //populate current weather box
      $(".cityInfo").text(
        city[0].toUpperCase() +
          city.slice(1) +
          " " +
          (parseInt(date.getMonth()) + 1) +
          "/" +
          date.getDate() +
          "/" +
          date.getFullYear()
      );
      $(".temp").html("Temperature: " + response.current.temp + " F");
      $(".humidity").html("Humidity: " + response.current.humidity + "%");
      $(".windSpeed").html(
        "Wind Speed: " + response.current.wind_speed + "MPH"
      );
      $(".uvIndex").html("UV Index: " + response.current.uvi);

      $(".icon").attr(
        "src",
        "http://openweathermap.org/img/wn/" +
          response.current.weather[0].icon +
          "@2x.png"
      );
	var uvIndexEl = $(".uvIndex");
      uvIndexEl.removeAttr("class");
      if (response.current.uvi < 3) {
        uvIndexEl.addClass("btn btn-success");
      } else if (response.current.uvi >= 3 && response.current.uvi < 5) {
        uvIndexEl.addClass("btn btn-warning");
      } else {
        uvIndexEl.addClass("btn btn-danger");
      }

      //populate future weather boxes
      var days = response.daily.slice(1);
      days.pop();
      days.pop();
      var htmlToShow = ``;
      days.forEach((day) => {
        htmlToShow += `<div class="border rounded  m-3" style="background-color:#5ee8de">`;

        var tempDate = new Date(day.dt * 1000);

        htmlToShow += `<p class="col-12" style="font-weight: bold;"> 
        ${parseInt(tempDate.getMonth()) + 1}
        /
        ${tempDate.getDate()} 
        / 
        ${tempDate.getFullYear()} 
        <p>`;
        htmlToShow += `<img alt='Weather Icon'   src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" />`;
        htmlToShow += `<p>Temp:  ${day.temp.day}  F</p>`;
        htmlToShow += `<p>Humidity: ${day.humidity}  %</p>`;

        htmlToShow += `</div>`;
      });
      $(".5DayForecast").html(htmlToShow);
    });
  });
}
//rendering pervious history
function renderPreviousHistory() {
  var history = JSON.parse(localStorage.getItem("history")) || [];
  var searchHistoryHTML = ``;
  $("#history").html();
  history.forEach((city) => {
    searchHistoryHTML += `<button class="btn btn-secondary m-2 btnPreviousHistory" type="button" data-search="${city}">${city}</button>`;
  });
  $("#history").html(searchHistoryHTML);
}
