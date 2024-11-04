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
export default {
  name: 'NavBar',
  data() {
    return {
      focusInput: null,
    }
  },
  emits:['searchNewDir', 'setFocus'],
  computed: {
    directory(){
      if(!this.focusInput) return this.currentDir
      return this.focusInput
    },
    test(){
      return this.currentDir
    }
  },
  props:{
    currentDir:{
      type: String,
      default: null
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
      console.log(this.currentDir, this.focusInput);
      document.getElementById('not-focus-bar').classList.add('hidden')
      document.getElementById('focus-bar').classList.remove('hidden')
      document.getElementById('focus-input').focus()
    },
  },
  watch:{
    'currentDir':{
      handler: function (newValue){
        this.focusInput = this.currentDir
      },
      deep:true
    }
  },
  mounted() {
    if(this.currentDir){
      this.focusInput = this.currentDir
      console.log(this.focusInput);
    }
  },
}
</script>

<style>
@import '../assets/NavBar.css';
</style>