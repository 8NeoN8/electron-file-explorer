<template>
  <!-- <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
  </div> -->

  <main class="main-container">
    <NavBar :currentDir="currentDir" @searchNewDir="fileList = getDirInfo($event)" @setFocus="this.componentFocus = $event"></NavBar>

    <div class="content-container">
      <button v-if="false" @click="changeHomeDir()"> change home directory </button>
  
      <ul class="file-list" id="file-list">
        <template v-for="(file, index) in fileList" :key="index">
          <li tabindex="0" @focus="tabManaging($event),this.componentFocus = 'list'" class="file-item" style="cursor: pointer;" @click="openFileOrDir(file)" @keyup.enter="openFileOrDir(file)">
            <div class="file-name">
              {{ file.filename }}
            </div>
            <div v-if="!file.isDir" class="file-size">
              {{ file.size }}
            </div>
          </li>
        </template>
        <li class="file-item hidden" id="temp-file-name">
          <input type="text" @blur="hideInput()" @keypress.enter="createFileOrDirectory(tempFileName)" @change="validateFileInput()" v-model="tempFileName">
        </li>
      </ul>

      <div class="route-history">
        <!-- {{ this.dirHistory }} -->

        <div class="buttons">
          <button class="prev" @click="backHistory()">back</button>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button class="next" @click="forwardHistory()">forth</button>
        </div>
      </div>

    </div>

  </main>
</template>

<script>
import NavBar from './components/NavBar.vue';
import config from './config.json';
const remote = require('@electron/remote');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

export default {
  data() {
    return {
      homeDir: config.homeDirectory,
      currentDir: config.homeDirectory,
      appConfig: config,
      fileList: [],
      dirHistory: [],
      historyIndex: 0,
      selectedFileOrFolder: null,
      tabManager: [],
      focusTab: null,
      componentFocus: null,
      tempFileName: null,

    }
  },
  components:{
    NavBar
  },
  computed: {
  },
  methods: {
    createFileOrDirectory(inputName){

      console.log(inputName);

      this.hideInput()

    },
    validateFileInput(){

    },
    hideInput(){
      let inputField = document.getElementById('temp-file-name')
      inputField.classList.add('hidden')
      this.tempFileName = null
      this.tabManager[0].focus()
    },
    ipcHandle(){
      window.Electron.ipcRenderer.send('ping')
    },
    async changeHomeDir(){
      let homePath = (await remote.dialog.showOpenDialog({properties: ['openDirectory', 'singleSelection']}))
      if(homePath.filePaths[0]) this.homeDir = homePath.filePaths[0]
      this.fileList = this.getDirInfo(this.homeDir)
    },
    getDirInfo(dir){
      if(dir){
        let filelist = []
        fs.readdirSync(dir).forEach(file => {
          let fileDir = path.join(dir,file)
          let fileStats = fs.statSync(fileDir)
          fileStats.filename = file
          fileStats.path = dir + '\\' + file
          filelist.push(fileStats)
          if(fs.statSync(fileDir).isDirectory()){
            fileStats.isDir = true
          }else fileStats.isDir = false
          fileStats.size =  Math.round(fileStats.size / 1024) + ' KB'
        })
        filelist = filelist.reverse()
        this.currentDir = dir
        return filelist
      }
    },
    manageHistory(dir){

      if(this.dirHistory[this.historyIndex+1]){
        this.dirHistory = this.dirHistory.slice(0, this.historyIndex+1) 
      }

      this.dirHistory.push(dir)
      this.historyIndex++
    },
    backHistory(){

      if(this.historyIndex > 0){
        this.historyIndex--
        this.fileList = this.getDirInfo(this.dirHistory[this.historyIndex])
      }
    },
    forwardHistory(){

      if(this.dirHistory[this.historyIndex+1]){
        this.historyIndex++
        this.fileList = this.getDirInfo(this.dirHistory[this.historyIndex])
      }
    },
    openFileOrDir(fileOrDir){
      let isDir = fs.statSync(fileOrDir.path).isDirectory()
      if(isDir){
        this.fileList = this.getDirInfo(fileOrDir.path)
        this.manageHistory(fileOrDir.path)
        this.tabManager[0].focus()

      }

      if(!isDir){
        exec(this.getCommandLine() + ' ' + fileOrDir.path)
      }

    },
    getCommandLine(){
      switch (process.platform) {
        case 'darwin': 
          return 'open';
        case 'win32': 
          return 'start';
        case 'win64': 
          return 'start';
        default: 
          return 'xdg-open';
      }
    },
    tabManaging(tab){
      this.tabManager = Array.from(document.getElementsByClassName('file-item'))
      this.focusTab = tab.srcElement
    },
    shortcutManager(keyevent){
      let taberIndex = this.tabManager.indexOf(this.focusTab)
      //console.log(keyevent);  
      switch (keyevent.key) {
        case 'Backspace':
          this.backHistory()  
          break;
        case 'ArrowDown':
          if(this.tabManager[taberIndex+1]){
            this.tabManager[taberIndex+1].focus()
          }
          break;
        case 'ArrowUp':
          if(taberIndex > 0){
            this.tabManager[taberIndex-1].focus()
          }
          break;
        case 'P':
          if (keyevent.ctrlKey) {
            this.controlPanel()
          }

          if (keyevent.ctrlKey && keyevent.altKey) {
            //*if global search open, select to search for date

            //*if file list search open, select to search for date too, it is a different target after all
          }
          
          break;
        case 'F':
          if (keyevent.ctrlKey) {
            this.searchGlobalPanel()
          }
          break;
        case 'G':
          if (keyevent.ctrlKey) {
            this.openThisFile()
          }
          break;
        case 'L':
          if (keyevent.ctrlKey) {
            this.sortSearchCurrentFiles()
          }
          if (keyevent.ctrlKey && keyevent.shiftKey) {
            this.forwardHistory()
          }
          break;
        case 'H':
          if (keyevent.ctrlKey && keyevent.shiftKey) {
            this.openHistoryView()
          }
          break;
        case 'J':
          if (keyevent.ctrlKey && keyevent.shiftKey) {
            this.backHistory()
          }
          break;
        case 'I':
          if (keyevent.altKey){

          }
          break;
        case 'O':
          if (keyevent.altKey){

          }
          break;
        case 'N':
          if(this.componentFocus == 'list'){
            if(keyevent.ctrlKey & keyevent.shiftKey){
              
            }
          }
          break;
        case '1':
          this.focusAppComponent(0)
          break;
        case '2':
          this.focusAppComponent(1)
          break;
        case '3':
          console.log(3);
          this.focusAppComponent(2)
          break;

      
        default:
          break;
      }
      
    },
    controlPanel(){

    },
    searchGlobalPanel(){

    },
    openThisFile(){

    },
    sortSearchCurrentFiles(){

    },
    focusAppComponent(component){

      if(component == 0){

      }
      if(component == 1){
        NavBar.methods.focusbar()
      }
      if(component == 2){
        this.tabManager[0].focus()
      }
    },
    

  },
  watch:{
  },
  created() {
    this.fileList = this.getDirInfo(this.homeDir)
    this.dirHistory.push(this.homeDir)
  },
  mounted() {
    document.addEventListener('mouseup', (e) => {
      switch (e.button) {
        case 3:
          this.backHistory()
          break;
        case 4:
          this.forwardHistory()
          break;
        default:
          break;
      }
    })

    document.addEventListener('keydown', (e)=>{
      this.shortcutManager(e)
    })

  },
  beforeUnmount(){
  },
}
</script>

<style>
@import './assets/appStyles.css'
</style>
