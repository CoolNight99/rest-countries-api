const HomeView = {
  template: `
    <div>
      <div class="search-and-filter-div d-flex justify-content-between gx-5 my-5">
        <div class="col-12 col-md-5 mb-3 mb-md-0">
          <div class="input-group">
            <span class="input-group-text" :class="[darkMode ? 'input-dark' : 'input-light']">
              <i class="fa-solid fa-magnifying-glass mx-2" :style="{ color: darkMode ? '#ffffff' : '#858585' }"></i>
            </span>
            <input type="text" class="form-control p-3" :class="[darkMode ? 'placeholder-dark' : 'placeholder-light']" v-model="searchInput" placeholder="Search for a country...">
          </div>
        </div>
        <div class="col-12 col-md-3">
          <select class="form-select p-3" v-model="filterInput" :style="{ backgroundColor: darkMode ? 'hsl(209, 23%, 22%)' : 'hsl(0, 0%, 100%)', color: darkMode ? 'hsl(0, 0%, 100%)' : 'hsl(0, 0%, 52%)' }">
            <option selected disabled value="">Filter by Region</option>
            <option v-for="region in regions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </div>
      </div>
      <div class="row country-cards">
        <div class="col-12 col-sm-6 col-md-3 mb-4 g-5" v-for="country in filteredCountries" :key="country.name.common">
          <div class="card country-card h-100">
            <img :src="country.flags.svg" class="card-img-top w-40" :alt="'Flag of ' + country.name.common">
            <div class="card-body p-4">
              <h5 class="card-title mb-4">{{ country.name.common }}</h5>
              <p class="card-text"><span>Population:</span> {{ country.population.toLocaleString() }}</p>
              <p class="card-text"><span>Region:</span> {{ country.region }}</p>
              <p class="card-text"><span>Capital:</span> {{ country.capital ? country.capital[0] : "N/A" }}</p>
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
  }  
};


const DetailedView = {
  template: `
            <div>

            </div>
            `
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
    props: true
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
      document.body.classList.toggle("dark-theme", this.darkMode);
      document.body.classList.toggle("light-theme", !this.darkMode);
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