<template>
  <main class="main-container">
    <NavBar :currentDir="currentDir" @searchNewDir="fileList = getDirInfo($event)" @setFocus="this.componentFocus = $event" @click="IPC_GetConfig()"></NavBar>

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
          <input type="text" id="temp-input" @blur="hideInput()" @keypress.enter="createFileOrDirectory(tempFileName)" @input="validateFileInput()" v-model="tempFileName">
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


    <dialog :open="isDialogOpen" class="confirm-delete-dialog" style="width: 50%; position: absolute; top: 45%; left: 50%; right: 50%;">

      <h3>Estas seguro que quieres enviar a la papelera?</h3>
      <div class="dialog-buttons" style="display: flex; width: 100%; justify-content: space-around;">
        <button class="confirm-deletion">Si</button>
        <button class="cancel-deletion">No</button>
      </div>
    </dialog>
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
      appConfig: null,
      fileList: [],
      dirHistory: [],
      historyIndex: 0,
      selectedFileOrFolder: null,
      tabManager: [],
      focusTab: null,
      componentFocus: null,
      tempFileName: null,
      isTempNameValid: true,
      isDialogOpen: false,
      recycleBinDir: null,
    }
  },
  components:{
    NavBar,
  },
  computed: {
  },
  methods: {
    execute(command, callback) {
      exec(command, (error, stdout, stderr) => { 
          if(error) console.log(error);
          callback(stdout); 
      });
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
              document.getElementById('temp-file-name').classList.remove('hidden')
              document.getElementById('temp-input').focus()
            }
          }
          break;
        case 'D':
          //* confirmation dialog for deletion
          this.isDialogOpen = true

          //* MY recycle bin location C:\$Recycle.Bin\S-1-5-21-474367234-958375406-904006301-1001
          /*
          *pasos para conseguir la ruta dinamicamente, en cmd
          * >whoami = username
          * > wmic usercaccount where name="username" get sid = sid of the current user
          * then stablish C:\$Recycle.Bin\userSID as trash location, if it exists, if it doesnt, then prompt the user to stablish the location of their recycle bin
          * but if they dont want, warn the user that any deletion done in the app is permanent and irreversible
          */
          break;
        case '1':
        if(keyevent.ctrlKey & keyevent.shiftKey){
          this.focusAppComponent(0)
        }
          break;
        case '2':
        if(keyevent.ctrlKey & keyevent.shiftKey){
          this.focusAppComponent(1)
        }
          break;
        case '3':
        if(keyevent.ctrlKey & keyevent.shiftKey){
          this.focusAppComponent(2)
        }
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
    
    //! AGREGAR MENSAJE DE ERROR POR AHORA SOLO NO TE DEJA CREAR EL ARCHIVO / DIRECTORIO
    createFileOrDirectory(inputName){
      

      let notValidFileNames = ['CON','PRN','AUX','NUL','COM1','COM2','COM3','COM4','COM5','COM6','COM7','COM8','COM9','COM0','LPT1','LPT2','LPT3','LPT4','LPT5','LPT6','LPT7','LPT8','LPT9','LPT0']
      
      for (let i = 0; i < notValidFileNames.length; i++) {
        if(this.tempFileName.includes('.')){
          let tempname = this.tempFileName.split('.')[0]

          if(this.tempFileName.includes(notValidFileNames[i])){
            console.log('Invalid character found');
            this.isTempNameValid = false
            return
          }
        }else{
          if(this.tempFileName.includes(notValidFileNames[i])){
            console.log('Invalid character found');
            this.isTempNameValid = false
            return
          }
        }
      }

      console.log(inputName);
      if(!this.isTempNameValid) {
        console.log('nombre no valido');
        return
      }

      console.log(inputName);
      let filepath = path.join(this.currentDir,inputName)

      if(this.tempFileName.includes('.')){
        fs.writeFile(filepath, '', {flag: 'wx'}, (err)=>{
          if(err) console.log('Error found on file>>: ', err);
        })
      }else{
        fs.mkdir(filepath, (err)=>{
          if(err) console.log('Error found on dir>>: ', err);
        })
      }

      this.hideInput()
      this.fileList = this.getDirInfo(this.currentDir)

    },

    //! AGREGAR MENSAJE DE ERROR POR AHORA SOLO NO TE DEJA CREAR EL ARCHIVO / DIRECTORIO

    validateFileInput(){
      
      
      
      let notValidChars = '<>:"/|?*'
      notValidChars = notValidChars.split('')
      notValidChars.push('\\')

      for (let i = 0; i < notValidChars.length; i++) {
        if(this.tempFileName.includes(notValidChars[i])){
          console.log('Invalid character found');
          this.isTempNameValid = false
          return
        }
      }

      if (!this.isTempNameValid) {
        this.isTempNameValid = true
      }
      
    },
    hideInput(){
      let inputField = document.getElementById('temp-file-name')
      inputField.classList.add('hidden')
      this.tempFileName = null
    },
    getWinBinDir(){
      let binDir = 'C:\\$Recycle.Bin\\'
      let username = null
      let userSID = null

      this.execute('whoami', (output) => {
        username = output.split('\\')[1]
        username = username.split('\r\n')[0]
    
        this.execute(`wmic useraccount where name="${username}" get sid`, (out) => {
          userSID = out.split('\r\r\n')[1]
        })
      });

      return binDir += userSID
    },
    async IPC_GetConfig(){
      if(this.appConfig == '' || this.appConfig == null || this.appConfig == undefined){
        this.appConfig = await window.api.getConfiguration()
      }
      
    },
  },
  watch:{
  },
  created() {
    this.fileList = this.getDirInfo(this.homeDir)
    this.dirHistory.push(this.homeDir)
  },
  async mounted() {
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
    
    await this.IPC_GetConfig()
  },
}
</script>

<style>
@import './assets/appStyles.css'
</style>
