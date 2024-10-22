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
    <NavBar :currentDir="currentDir"></NavBar>

    <div class="content-container">
      <button v-if="false" @click="changeHomeDir()"> change home directory </button>
  
      <ul class="file-list">
        <template v-for="(file, index) in fileList" :key="index">
          <li tabindex="0" class="file-item" style="cursor: pointer;" @click="openFileOrDir(file)">
            <div class="file-name">
              {{ file.filename }}
            </div>
            <div v-if="!file.isDir" class="file-size">
              {{ file.size }}
            </div>
          </li>
        </template>
      </ul>

      <div class="route-history">
        {{ this.dirHistory }}

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
    }
  },
  components:{
    NavBar
  },
  computed: {
  },
  methods: {
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
  },
  beforeUnmount(){
    document.removeEventListener('mouseup')
  },
}
</script>

<style>
@import './assets/appStyles.css'
</style>
