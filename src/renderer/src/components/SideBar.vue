<template>
  <div v-if="isShowing" id="side-bar" class="side-bar">

    <div class="search-bar-input-container">
      <input type="text" name="search-bar-input" id="search-bar-input" class="search-bar-input" placeholder="Search">
    </div>

    <div class="side-bar-content">

      <div class="search-bar-results" v-if="searchResults.length > 0">

        <h4 class="results-title">Search Results</h4>
        <template v-for="(resItem, index) in searchResults" :key="index">
          <div class="search-bar-result-item" @click="this.$emit('openSearchResult', resItem)">
            <i class="pi pi-reply"></i> <span class="result-item-name"> {{ resItem.filename }} </span>
          </div>
        </template>

      </div>
  
  
      <div class="side-bar-quick-access">
        <h4 class="quick-title">Quick Access</h4>
  
        <div class="side-bar-quick-access-list">
          <template v-for="(quickItem, index) in quickItems" :key="index" v-if="quickItems.length > 0">
            <div class="side-bar-quick-item" @click="this.$emit('openQuickAccess', quickItem)">
              <i class="pi pi-bookmark"></i> <span class="quick-item-name"> {{ quickItem.filename }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
export default {
  name: 'SideBar',
  data() {
    return {
      quickItems:[
        {
          filename:'GamesLibrary',
          filePath: 'D:\\MIS_NUEVOS_ARCHIVOS\\GamesLibrary'
        },
        {
          filename:'añskmesLiasb',
          filePath: 'D:\\MIS_NUEVOS_ARCHIVOS\\GamesLibrary'
        },
        {
          filename:'loremlakndfljkafnLibary',
          filePath: 'D:\\MIS_NUEVOS_ARCHIVOS\\GamesLibrary'
        },
        {
          filename:'GamesLibrary',
          filePath: 'D:\\MIS_NUEVOS_ARCHIVOS\\GamesLibrary'
        },
        
      ],
      searchResults:[
        
      ],
    }
  },
  props:{
    isShowing:{
      type: Boolean,
      default: false
    }
  },
  emits:[
  'openQuickAccess',
  'openSearchResult'

  ],
  methods: {
    test(data){
      console.log(data);
    }
  },
}
</script>

<style>
@import '../assets/SideBar.css'
</style>