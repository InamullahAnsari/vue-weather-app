<template>
  <div class="hello">
      <h1>{{ msg }}</h1>
    <div class="input-fields">
      <AutoComplete
        v-model="searchCity"
        :cityName="searchCity"
        :items="items"
        aria-labelled-by="fruitlabel"
      />
      <button class="search-btn" @click="onSearchClick()">Search Weather</button>
    </div>
    <div class='box'>
  <div class='wave -one'></div>
  <div class="weathercon"><i class='fas fa-cloud' style='color: #d36326;'></i></div>
  <div class="info">
    <h2 class="location">{{ city_name.toUpperCase() }}</h2>
    <p class="date">{{ currentDate }}</p>
    <h1 class="temp">{{ temprature }} </h1>
    <div class="weather-description">
      <div class="weather-sideheading">
        <div>Weather Clearity:</div>
        <div>Weather Description:</div>
      </div>
      <div class="weather-description-value">
        <div>{{weatherClearity.toUpperCase()}}</div>
        <div>{{weatherDescription.toUpperCase()}}</div>
      </div>
      </div>
  </div>
  <div class="wind-cloudiness-humidity">
    <div class="wcm-label">
      <div class="wind-label">Wind</div>
      <div class="cloudiness-label">Cloudiness</div>
      <div class="humidity-label">Humidity</div>
    </div>
    <div class="wcm-value">
      <div class="wind-value">{{wind}} m/s</div>
      <div class="cloudiness-value">{{cloudiness}}&percnt;</div>
      <div class="humidity-value">{{humidity}}&percnt;</div>
    </div>
  </div>   
</div>
    <span>Enable location to see yours! :)</span><br>
    <span>Otherwise it will show your last searched location</span>
  </div>
</template>

<script>
import AutoComplete from "@/components/AutoComplete.vue";
import service from "../services/service.js";
import {fbObj} from "../firebaseConfig.js";

export default {
  name: "Weather",
  components: {
    AutoComplete
  },
  data: function() {
    return {
      items: ['Belgaum','Bengaluru', 'Burhanpur', 'Indore', 'Mumbai', 'Nagpur', 'Bhopal', 'Chennai', 'Delhi', 'Kolkata'],
      result: undefined,
      temprature: undefined,
      weatherClearity: '',
      weatherDescription: '',
      currentDate: null,
      weather: null,
      favouriteCities: [],
      wind: undefined,
      cloudiness: undefined,
      humidity: undefined,
      city_name: '',
      searchCity: '',
      cities:
        "[ 'Bengaluru', 'Burhanpur', 'Indore', 'Mumbai', 'Nagpur', 'Bhopal', 'Chennai', 'Delhi', 'Kolkata']"
    };
  },
  props: {
    msg: String
  },
  async mounted() {},
  async created() {
    const data = this.$localStorage.get("favouriteCities");
    this.searchCity = data;

    navigator.geolocation.getCurrentPosition(
      async pos => {
        this.location = pos;
        const location = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };

        console.log("pos", pos);
        if (this.searchCity) {
          this.getWeatherByCity(this.searchCity);
        } else {
          this.getWeatherByLatLong(location);
        }
      },
      err => {
        this.getWeatherByCity(this.searchCity);
        this.errorStr = err.message;
      }
    );
  },
  methods: {
    // helper function for converting temprature form kelvin to celcius
    async kelvinToCelcius(kTemprature) {
      const celciusTemprature = (kTemprature - 273.15).toFixed(2);
      return `${celciusTemprature} ℃`;
    },
    
    // helper function to connvert Date
    async epochConverter(eDate) {
      const utcDateTime = new Date(eDate * 1000);
      return utcDateTime.toDateString();
    },

    // helper function to call API on the Basis of given name
    async getWeatherByCity(city) {
      //console.log("city:", city);
      this.result = await service.getWeather(city);
      this.weatherClearity = this.result.data.weather[0].main;
      this.weatherDescription = this.result.data.weather[0].description;
      const kelvinTemprature = this.result.data.main.temp;
      this.temprature = await this.kelvinToCelcius(kelvinTemprature);
      const epochDate = this.result.data.dt;
      this.currentDate = await this.epochConverter(epochDate);
      this.weather = this.result.data.weather[0].main;
      this.wind = this.result.data.wind.speed;
      this.cloudiness = this.result.data.clouds.all;
      this.humidity = this.result.data.main.humidity;
      this.city_name = this.result.data.name;
      // console.log("data", this.result);
      this.saveToLocalStorage(city);
    },

    // helper function to save searched city into local storage
    saveToLocalStorage(city) {
      this.$localStorage.set("favouriteCities", city);
    },

    // helper function to get wearher detail by passing Latitude and Longitude
    async getWeatherByLatLong(location) {
      this.result = await service.getWeatherByLatLong(location);
      this.weatherClearity = this.result.data.weather[0].main;
      this.weatherDescription = this.result.data.weather[0].description;
      const kelvinTemprature = this.result.data.main.temp;
      this.temprature = await this.kelvinToCelcius(kelvinTemprature);
      const epochDate = this.result.data.dt;
      this.currentDate = await this.epochConverter(epochDate);
      this.weather = this.result.data.weather[0].main;
      this.wind = this.result.data.wind.speed;
      this.cloudiness = this.result.data.clouds.all;
      this.humidity = this.result.data.main.humidity;
      this.city_name = this.result.data.name;
      //console.log(latLongAPIResponse);
      this.saveToLocalStorage(this.result.data.name);
    },

    // Search button handler function with firebase configuration
    async onSearchClick() {
      this.getWeatherByCity(this.searchCity);
      console.log("****fb******", fbObj.citiesRef);
      const newCity ={
        city: this.searchCity
      }
      // to store the searched values in firebase
      fbObj.Firebase.firestore().collection("cities").add(newCity)
      .then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
      // to get the already searched cities from firebase 
      const snapshot = await fbObj.Firebase.firestore().collection('cities').get();
      const data = snapshot.docs.map(doc => doc.data());
      const cities = data.map(d => {
        if(typeof d.city === 'string')
          return d.city;
      });
      this.items = [...new Set(cities)];
      console.log(' --------;)------fB documents ----------',this.items);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
    padding: 0;
    margin: 0;
    font-family: Quicksand;
}
body {
    background: #f3f2ef;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    height: 100vh;
    width: 100vw;
}
html, body {
    height: 100%;
}
html {
    background: #eee;
}
.fa, .fas {
    font-weight: 900;
    font-size: 125px;
}
.box {
    width: 30vw;
    height: 80vh;
    border-radius: 5px;
    box-shadow: 0 2px 30px rgba(0, 0, 0, 0.2);
    background: #a5bbdd;
    position: relative;
    overflow: hidden;
    transform: translate3d(0, 0, 0);
    min-width: 200px;
    min-height: 350px;    
    margin: 0 auto;
}
.wave {
    opacity: 0.3;
    position: absolute;
    top: 120%;
    left: 50%;
    background: white;
    width: 500px;
    height: 500px;
    margin-left: -250px;
    margin-top: -250px;
    transform-origin: 50% 48%;
    border-radius: 43%;
    animation: drift 3000ms infinite linear;
    z-index: 1;
}
.wave.-three {
    animation: drift 5000ms infinite linear;
    z-index: 2 !important;
    opacity: 0.2;
}
.wave.-two {
    animation: drift 7000ms infinite linear;
    opacity: 0.1;
    z-index: 3 !important;
}
.box:after {
    content: "";
    display: block;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 11;
    transform: translate3d(0, 0, 0);
}
@keyframes drift {
    from {
     transform: rotate(0deg);
    }
    from {
     transform: rotate(360deg);
    }
}
.info {
    position: absolute;
    bottom: 100px;
    width: 100%;
    height: 45%;
    z-index: 4;
}
.location {
    text-align: center;
    font-weight: 800;
    margin-top: 10%;
}
.date {
    text-align: center;
    margin-top: 5%;
    color: #9a9a9a;
    font-size: 70%;
}
.temp {
    margin-top: 5%;
    text-align: center;
}
.weathercon {
    height: 35%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3em;
}
@media (max-width: 600px) {
    .box {
        width: 90vw;
        height: 80vh;
    }
    .wave {
        top: 85%;
    }
    .weathercon {
        font-size: 5em;
    }
    .info {
        font-size: 1.5rem;
    }
    .weather-description {
      margin-top: 5%;
    }
    .wind-cloudiness-humidity {
      position: fixed;
    }
}
@media (max-height: 500px) {
    .box {
        height: 80vh;
    }
    .wave {
        top: 115%;
    }
    .wind-cloudiness-humidity {
      position: fixed;
    }
}
body > span {
    width: 100vw;
    text-align: center;
    color: grey;
}

.hello {
  background-color: #e4e3e0;
}

.input-fields {
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  width: 30vw;
  justify-content: space-between;
  padding: 10px;
  box-sizing: content-box;
}

.button-fields {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.search-btn {
  width: 100px;
  height: 30px;
  background-color: #484f60;
  border-style: none;
  color: hsla(0, 0%, 100%, 0.75);
}

h1 {
  color: #484f60;
}

.weather-description {
  display: flex;
  flex-direction: row;
  margin-top: 5%;
}

.weather-sideheading {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    color: firebrick;
    font-size: 15px;
    font-style: italic;
}

.weather-description-value {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #eeefff;
    font-size: 15px;
    font-style: oblique;
    margin-left: 5%;
}

.wind-cloudiness-humidity {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 60%;
}

.wcm-label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: darkred;
    font-size: 15px;
    font-style: italic;
}

user agent stylesheet div {
  display: block;
}
</style>
