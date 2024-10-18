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

    <button @click="changeHomeDir()"> change home directory </button>

    <ul class="file-list">
      <template v-for="(file, index) in fileList" :key="index">
        <li tabindex="0" class="file-item" style="cursor: pointer;" @click="openFileOrDir(file)">
          {{ file.filename }}
        </li>
      </template>
    </ul>
  </main>
</template>

<script>
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
      dirHistory: [],
      dirRoutes:{
        previous: null,
        current: config.homeDirectory,
        next: null
      },
      fileList: [],
    }
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
        })
        filelist = filelist.reverse()
        console.log(this.fileList);
        return filelist
      }
    },
    openFileOrDir(fileOrDir){
      let isDir = fs.statSync(fileOrDir.path).isDirectory()
      if(isDir){
        this.fileList = this.getDirInfo(fileOrDir.path)
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
    }
  },
  watch:{
  },
  created() {
    this.fileList = this.getDirInfo(this.homeDir)
  },
  mounted() {
    
  },
}
</script>

<style>
@import './assets/appStyles.css'
</style>
