<template>
  <nav class="nav-bar">
    {{ currentDir }}
  </nav>
</template>

<script>
import config from '../config.json'
export default {
  name: 'NavBar',
  data() {
    return {
      
    }
  },
  props:{
    currentDir:{
      type: String,
      default: config.homeDirectory
    }
  },
  methods: {
    
  },
}
</script>

<style>

</style>