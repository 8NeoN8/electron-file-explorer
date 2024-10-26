<template>
  <nav class="nav-bar" id="nav-bar" tabindex="0" @focus="focusbar(), this.$emit('setFocus', 1)">

    <div class="not-focus-bar" id="not-focus-bar">
      {{ directory }}
    </div>
    <div class="focus-bar hidden" id="focus-bar">
      <input 
        type="text" 
        v-model="focusInput" 
        class="focus-input" 
        id="focus-input" 
        @keypress.enter="checkError()"
        tabindex="0"
        @blur="unfocus()"
      >
    </div>
  </nav>
</template>

<script>
const fs = require('fs');
const path = require('path');
import config from '../config.json'
export default {
  name: 'NavBar',
  data() {
    return {
      focusInput: this.currentDir,
    }
  },
  emits:['searchNewDir', 'setFocus'],
  computed: {
    directory(){
      if(!this.focusInput) return this.currentDir
      return this.focusInput
    }
  },
  props:{
    currentDir:{
      type: String,
      default: config.homeDirectory
    }
  },
  methods: {
    checkError(){
      fs.access(this.focusInput, fs.constants.F_OK, (error) =>{
        if(error) console.log("There's an error>>: ", error)
        if(!error){
          document.getElementById('focus-bar').classList.add('hidden')
          document.getElementById('not-focus-bar').classList.remove('hidden')
          this.$emit('searchNewDir', this.focusInput)
        };
      })
    },
    unfocus(){
      this.focusInput = this.currentDir
      document.getElementById('focus-bar').classList.add('hidden')
      document.getElementById('not-focus-bar').classList.remove('hidden')
    },
    focusbar(){
      document.getElementById('not-focus-bar').classList.add('hidden')
      document.getElementById('focus-bar').classList.remove('hidden')
      document.getElementById('focus-input').focus()
    },
  },
}
</script>

<style>

</style>