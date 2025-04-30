const HomeView = {
  template: `
    <div>
      <div class="container search-and-filter-div gx-5 my-5 mx-0">
        <div class="row">
          <div class="col-12 col-md-6 gx-5 ">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fa-solid fa-magnifying-glass mx-2" :style="{ color: darkMode ? '#ffffff' : '#858585' }"></i>
              </span>
              <input type="text" class="form-control p-3" :class="{'placeholder-dark': darkMode, 'placeholder-light': !darkMode}" v-model="searchInput" placeholder="Search for a country...">
            </div>
          </div>
          <div class="col-12 col-md-3 ms-md-auto mt-3 mt-md-0">
            <select class="form-select p-3 mt-5 mt-md-0" v-model="filterInput">
              <option selected value="">{{ filterInput ? "All" : "Filter by Region" }}</option>
              <option v-for="region in regions" :key="region" :value="region">
                {{ region }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="row country-cards">
          <div class="col-12 col-sm-6 col-md-3 mb-4 g-5" v-for="country in filteredCountries" :key="country.name.common">
            <div class="card country-card h-100">
              <img :src="country.flags.svg" class="card-img-top w-40" :alt="'Flag of ' + country.name.common">
              <div class="card-body p-4">
                <h5 class="card-title mb-4" @click="openDetailedView(country.name.common)">{{ country.name.common }}</h5>
                <p class="card-text"><span>Population:</span> {{ country.population.toLocaleString() }}</p>
                <p class="card-text"><span>Region:</span> {{ country.region }}</p>
                <p class="card-text"><span>Capital:</span> {{ country.capital ? country.capital[0] : "N/A" }}</p>
              </div>
            </div>
          </div>
        </div>    
      </div>
    </div>
  `,

  props: ["countries", "regions", "searchForCountry", "darkMode"],

  data() {
    return {
      searchInput: this.searchForCountry,
      filterInput: ""
    };
  },

  computed: {
    filteredCountries() {
      return this.countries.filter(country => {
        const matchesSearch = this.searchInput ? country.name.common.toLowerCase().includes(this.searchInput.toLowerCase()) : true;
        const matchesRegion = this.filterInput ? country.region === this.filterInput : true;
        return matchesSearch && matchesRegion;
      });
    }
  },

  methods: {
    updateSearchInput() {
      this.$emit('update:searchForCountry', this.searchInput);
    },

    openDetailedView(name) {
      this.$router.push(`/country/${name}`);
    }
  }
};

const DetailedView = {
  template: `
    <div class="detailed-view-div">
      <button class="btn back-btn px-4 my-5 mx-4" @click="goBack()"><i class="fa-solid fa-arrow-left mx-2"></i> Back</button>
      <div v-if="countryDetails.flags" class="container">
        <div class="row">
          <div class="col">
            <img :src="countryDetails.flags.svg" class="card-img-top w-40" :alt="'Flag of ' + countryDetails.name.common">
          </div>
          <div class="col mx-5">
            <h3 class="mb-4">{{ countryDetails.name.common }}</h3>
            <div class="row">
              <div class="col">
                <p v-if="countryDetails.name?.nativeName"><span>Native Name:</span> {{ Object.values(countryDetails.name.nativeName)[0].official }}</p>
                <p><span>Population:</span> {{ countryDetails.population.toLocaleString() }}</p>
                <p><span>Region:</span> {{ countryDetails.region }}</p>
                <p><span>Sub Region:</span> {{ countryDetails.subregion }}</p>
                <p><span>Capital:</span> {{ countryDetails.capital ? countryDetails.capital[0] : "N/A" }}</p>
              </div>
              <div class="col">
                <p><span>Top Level Domain:</span> .{{ countryDetails.cca2.toLowerCase() }}</p>
                <p><span>Currencies:</span> {{ Object.values(countryDetails.currencies).map(c => c.name).join(", ") }}</p>
                <p><span>Languages:</span> {{ Object.values(countryDetails.languages).join(", ") }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  props: ['country'],

  data() {
    return {
      countryDetails: {} 
    };
  },

  mounted() {
    this.fetchCountryDetails();
  },

  methods: {
    async fetchCountryDetails() {
      const name = this.$route.params.name;
      try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${name}`);
        const data = await res.json();
        this.countryDetails = data[0];
      } catch (err) {
        console.error(err);
      }
    },

    goBack() {
      this.$router.push("/");
    }
  }
};

const routes = [
  { 
    path: "/", 
    component: HomeView, 
    props: true 
  },

  {
    path: "/country/:name",
    component: DetailedView,
  }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

const countriesApp = Vue.createApp({
  data() {
    return {
      darkMode: false,
      searchForCountry: "",
      countries: [],
      regions: ["Africa", "Americas", "Asia", "Europe", "Oceania"]
    };
  },
  mounted() {
    this.fetchCountries();
  },

  methods: {
    async fetchCountries() {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all");
        const data = await res.json();
        this.countries = data;
      } catch (err) {
        console.error(err);
      }
    },

    changeMode() {
      this.darkMode = !this.darkMode;
      document.documentElement.classList.toggle("dark-theme", this.darkMode);
      document.documentElement.classList.toggle("light-theme", !this.darkMode);    
    },

    openDetailedView(name) {
      this.$router.push(`/country/${name}`);
    },
  },

  provide() {
    return {
      darkMode: this.darkMode,
      changeMode: this.changeMode,
    };
  },
});


// Give router access to the app
countriesApp.use(router);

// Mount the app
countriesApp.mount("#countries");
