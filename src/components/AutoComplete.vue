<template>
  <div>
    <input
      type="text"
      @input="onChange"
      v-model="searchCity"
      @keyup.down="onArrowDown"
      @keyup.up="onArrowUp"
      @keyup.enter="onEnter"
      aria-multiline="false"
      role="searchbox"
      aria-autocomplete="list"
      aria-controls="autocomplete-results"
      :aria-activedescendant="activedescendant"
      :aria-labelledby="ariaLabelledBy"
      placeholder="Search City"
      class="text-input"
    />
    <ul id="autocomplete-results" v-show="isOpen" class="autocomplete-results" role="listbox">
      <li class="loading" v-if="isLoading">Loading results...</li>
      <li
        v-else
        v-for="(result, i) in results"
        :key="i"
        @click="setResult(result)"
        class="autocomplete-result"
        :class="{ 'is-active': isSelected(i) }"
        role="option"
        :id="getId(i)"
        :aria-selected="isSelected(i)"
      >{{ result }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "AutoComplete",
  props: {
    cityName:{
        type: String,
        required: false,
        default: ''
    },
    items: {
      type: Array,
      required: false,
      default: () => []
    },
    isAsync: {
      type: Boolean,
      required: false,
      default: false
    },
    ariaLabelledBy: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isOpen: false,
      results: [],
      searchCity: "",
      isLoading: false,
      arrowCounter: 0,
      activedescendant: ""
    };
  },
  methods: {
    onChange() {
      // Let's warn the parent that a change was made
      console.log('changing-----',this.searchCity)
      this.$emit("input", this.searchCity);

      // Is the data given by an outside ajax request?
      if (this.isAsync) {
        this.isLoading = true;
      } else {
        // Let's search our flat array
        this.filterResults();
        this.isOpen = true;
      }
    },

    filterResults() {
      // first uncapitalize all the things
      console.log('------this.items.-- ',this.items)
      this.results = this.items.filter(item => {
        return item.toLowerCase().indexOf(this.searchCity.toLowerCase()) > -1;
      });
    },
    setResult(result) {
      this.searchCity = result;
      console.log('select',this.searchCity);
      this.$emit("input", this.searchCity);
      this.isOpen = false;
    },
    onArrowDown(evt) {
      if (this.isOpen) {
        if (this.arrowCounter < this.results.length) {
          this.arrowCounter = this.arrowCounter + 1;
          this.setActiveDescendent();
          console.log(evt);
        }
      }
    },
    onArrowUp() {
      if (this.isOpen) {
        if (this.arrowCounter > 0) {
          this.arrowCounter = this.arrowCounter - 1;
          this.setActiveDescendent();
        }
      }
    },
    onEnter() {        
      this.searchCity = this.results[this.arrowCounter];
      console.log('enter',this.searchCity);
      this.$emit("input", this.searchCity);

      this.isOpen = false;
      this.arrowCounter = -1;
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
    setActiveDescendent() {
      this.activedescendant = this.getId(this.arrowCounter);
    },
    isSelected(index) {
      return index === this.arrowCounter;
    },
    getId(index) {
      return `result-option-${index}`;
    }
  },
  watch: {
    items: function(val, oldValue) {
      // actually compare them
      if (val.length !== oldValue.length) {
        this.results = val;
        this.isLoading = false;
      }
    }
  },
  mounted() {
      console.log('cityinAC', this.cityName);
      if(this.cityName){
          this.searchCity = this.cityName;
      }
    document.addEventListener("click", this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  }
};
</script>

<style scoped>
.text-input {
    width: 150px;
    height: 20px;
    border-radius: 5px;
    font-size: medium;
    border-style: none;
    padding: 5px;
}

.autocomplete {
  position: relative;
  width: 130px;
}

.autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid #eeeeee;
  height: 120px;
  overflow: auto;
  width: 100%;
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}

.autocomplete-result.is-active,
.autocomplete-result:hover {
  background-color: #4aae9b;
  color: white;
}
</style>