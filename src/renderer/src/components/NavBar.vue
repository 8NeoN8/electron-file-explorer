<template>
  <!--@focus="focusbar(), this.$emit('setFocus', 1)"-->
  <nav class="nav-bar" id="nav-bar" tabindex="0" >

    <div class="nav-bar-buttons">
      <button data-tooltip="Back" class="pi pi-chevron-left nav-button back-button" @click="this.$emit('historyBack')"></button>
      <button data-tooltip="Up" class="pi pi-arrow-up nav-button up-button" @click="this.$emit('dirUp')"></button>
      <button data-tooltip="Forth" class="pi pi-chevron-right nav-button forward-button" @click="this.$emit('historyForth')"></button>
    </div>

    <div class="nav-bar-path-display">
      <span class="path-begin-icon pi pi-angle-double-right"></span>

      <input 
        type="text" 
        tabindex="0" 
        id="nav-bar-dir-path" 
        class="nav-bar-dir-path"
        v-model="dirPath"
        @keypress.enter="searching = true; validateInput()"
        @blur="searching == false ? dirPath = currentDir : null"
        @focus="searching = false"
      >
    </div>

    <div class="extra-options nav-bar-buttons">
      <button class="pi pi-refresh nav-button refresh-button" @click="this.$emit('dirRefresh')"></button>
      <button class="pi pi-book nav-button shortcut-sheet-button" @click="this.$emit('showShortcuts')"></button>
      <button class="pi pi-list nav-button feature-list-button" @click="this.$emit('showFeatures')"></button>
    </div>
  

  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      focusInput: null,
      dirPath: null,
      searching: false
    }
  },
  emits:[
    'getPath',
    'historyBack',
    'historyForth',
    'dirUp',
    'dirRefresh',
    'showShortcuts',
    'showFeatures'
  ],
  computed: {
    directory(){
      let temp = this.currentDir
      return temp
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

    async IPC_verifyPath(path){
      return await window.api.verifyPath(path)
    },

    async validateInput(){
      const result = await this.IPC_verifyPath(this.dirPath)
      if(result.type == 'ok'){
        document.getElementById('nav-bar-dir-path').blur()
        this.$emit('getPath',this.dirPath)
      }
    },

  },
  watch:{
    'currentDir':{
      handler: function (newValue){
        this.dirPath = this.currentDir
      },
      deep:true
    }
  },
}
</script>

<style>
@import '../assets/NavBar.css';
</style>