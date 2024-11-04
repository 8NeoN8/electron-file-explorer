<template>
  <main class="main-container">
    <NavBar v-if="true" :currentDir="currentDir" @searchNewDir="fileList = getDirInfo($event), dirHistory.push($event)" @setFocus="this.componentFocus = $event"></NavBar>

    <div class="content-container">
  
      <ul v-if="fileList" class="file-list" id="file-list">
        <li class="file-item" id="file-list-column-headers">
          <div class="file-name file-item-header">
            Name
          </div>
          <div class="file-create-date file-item-header">
            CreationDate
          </div>

          <div class="file-type file-item-header">
            Type
          </div>
          <div class="file-size file-item-header">
            Size
          </div>
        </li>

        <li class="file-item hidden" id="temp-file-name">
          <input type="text" id="temp-input" @blur="hideInput()" @keypress.enter="createFileOrDirectory(tempFileName)" @input="validateFileInput()" v-model="tempFileName">
        </li>
        
        <template v-for="(file, index) in fileList" :key="index">

          <li tabindex="0" @focus="tabManaging($event, file),this.componentFocus = 'list'" class="file-item" style="cursor: pointer;" @click="openFileOrDir(file)" @keyup.enter="openFileOrDir(file)">
            <div class="file-name file-item-component">
              {{ file.fileName }}
            </div>
            <div class="file-create-date file-item-component">
              {{ file.birthtime }}
            </div>

            <div class="file-type file-item-component">
              {{ file.isDir ? 'Folder' : 'File' }}
            </div>
            <div class="file-size file-item-component">
              {{ file.size ? `${file.size} KB` : '' }}
            </div>
          </li>

        </template>

      </ul>

      <div v-if="fileList.length == 0 && !appConfig.homeDirectory" class="prompt-home-dir">
        <h1 class="explorer-title">NeoN Explorer</h1>
        <p class="explorer-description">
          Simple file explorer made with electron, visit the <a href="#">github</a> to know more!
        </p>

        <div class="set-home-dir-call">
          Click <a href="#" class="change-home-dir-link" @click="changeHomeDir()">here</a> to set the home directory the app will open on
        </div>

      </div>

      <div class="route-history">

        <div style="color: white;">
          {{ dirHistory }}
        </div>

        <div class="buttons">
          <button class="prev" @click="backHistory()">back</button>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button class="next" @click="forwardHistory()">forth</button>
          <br>
          <button @click="changeHomeDir()"> Change home dir</button>
          <br>
          <button @click="isDialogOpen = !isDialogOpen">pruab dialog</button>
          <br>
          <button @click="openBin(); manageHistory(appConfig.recycleBinDir)">Open recyclebin</button>
          <br>
          <button @click="clearFakeTrash()">Clear recycle bin</button>
        </div>

      </div>

    </div>


    <dialog :open="isDialogOpen" class="confirm-delete-dialog" style="width: 50%; position: absolute; top: 45%; left: 50%; right: 50%;">

      <h3>Estas seguro que quieres enviar a la papelera?</h3>
      <div class="dialog-buttons" style="display: flex; width: 100%; justify-content: space-around;">
        <button class="confirm-deletion" @click="IPC_SendToTrash(focusFile);reloadDir()">Si</button>
        <button class="cancel-deletion" @click="isDialogOpen = !isDialogOpen">No</button>
      </div>

    </dialog>

  </main>
</template>

<script>
import NavBar from './components/NavBar.vue';
import { format } from 'date-fns';
const remote = require('@electron/remote');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

export default {
  data() {
    return {
      currentDir: null,
      appConfig: {},
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
      focusFile: null,
      singleCopyFile: null
    }
  },
  components:{
    NavBar,
  },
  methods: {

    async IPC_GetConfig(){
      this.appConfig = await window.api.getConfiguration()
    },

    async changeHomeDir(){

      const selectPath = await remote.dialog.showOpenDialog({properties: ['openDirectory', 'singleSelection']})
      const homeDirectory = selectPath.filePaths[0]

      if(homeDirectory){
        this.fileList = this.getDirInfo(homeDirectory)
        this.IPC_ChangeHomeDirectory(homeDirectory)
        this.currentDir = homeDirectory
        this.IPC_GetConfig()
      }

    },

    async IPC_ChangeHomeDirectory(homeDirectory){
      await window.api.setHomeDirectory(homeDirectory)
    },

    async clearFakeTrash(){
      await window.api.clearTrash()
    },

    openBin(){
      //S-1-5-21-474367234-958375406-904006301-1001
      const pruebas = 'D:\\MIS_NUEVOS_ARCHIVOS\\PRUEBAS_DEL_EXPLORER'
      const bin = 'C:\\$Recycle.Bin\\S-1-5-21-474367234-958375406-904006301-1001'
      let binFiles = this.getDirInfo(bin)

      let realFiles = []

      binFiles.forEach(file => {
        if(!file.fileName.includes('$') && !file.fileName.includes('desktop.ini')){

          const destination = path.join(pruebas, file.fileName)

          fs.copyFile(file.filePath, destination, (err) => {
            if(err) console.log('Error Moving file>>: ', err);
          })

          return realFiles.push(file)
        }
      })
      this.fileList = realFiles

      
    },

    getDirInfo(dir){
      if(dir){
        let files = fs.readdirSync(dir).map(file => {

          let filePath = path.join(dir,file)
          let fileInfo = fs.statSync(filePath)

          fileInfo.fileName = file
          fileInfo.filePath = filePath

          fs.statSync(filePath).isDirectory() ? fileInfo.isDir = true : fileInfo.isDir = false

          
          fileInfo.size =  Math.round(fileInfo.size / 1024)

          fileInfo.birthtime = format(fileInfo.birthtime, "dd/MM/yyyy")

          return fileInfo
        })

        files = files.sort((a, b) => b.isDir - a.isDir)
        
        this.currentDir = dir

        return files
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
      let isDir = fs.statSync(fileOrDir.filePath).isDirectory()
      if(isDir){
        this.fileList = this.getDirInfo(fileOrDir.filePath)
        this.manageHistory(fileOrDir.filePath)
        this.tabManager[0].focus()

      }

      if(!isDir){
        exec(this.getCommandLine() + ' ' + fileOrDir.filePath)
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

    tabManaging(tab, file){
      this.tabManager = Array.from(document.getElementsByClassName('file-item'))
      this.focusTab = tab.srcElement
      this.focusFile = file
    },

    async IPC_SendToTrash(file){
      //'D:\\MIS_NUEVOS_ARCHIVOS\\prueba recycle bin 2'

      await window.api.sendToTrash(file.filePath)
      this.isDialogOpen = false
      this.focusFile = null
      this.fileList = this.getDirInfo(this.currentDir)
    },

    shortcutManager(keyEvent){

      //* MY recycle bin location C:\$Recycle.Bin\S-1-5-21-474367234-958375406-904006301-1001
      /*
      *pasos para conseguir la ruta dinamicamente, en cmd
      * >whoami = username
      * > wmic usercaccount where name="username" get sid = sid of the current user
      * then stablish C:\$Recycle.Bin\userSID as trash location, if it exists, if it doesnt, then prompt the user to stablish the location of their recycle bin
      * but if they dont want, warn the user that any deletion done in the app is permanent and irreversible
      */
     const file_list = Array.from(document.querySelectorAll('.file-item'))
     this.tabManager = file_list

      let taberIndex = this.tabManager.indexOf(this.focusTab)


      //console.log(keyEvent);  

      switch (keyEvent.key.toLowerCase()) {
        case 'backspace':
          this.backHistory()  
          break;
        case 'arrowdown':
          if(!this.focusTab && !this.focusFile){
            file_list[2].focus()
          }
          if(this.tabManager[taberIndex+1]){
            this.tabManager[taberIndex+1].focus()
          }
          if(taberIndex == this.tabManager.length-1){
            file_list[2].focus()
          }
          break;
        case 'arrowup':
          if(taberIndex > 0){
            this.tabManager[taberIndex-1].focus()
          }
          if(taberIndex == 2){            
            file_list[file_list.length-1].focus()
          }
          break;
        case 'p':
          if (keyEvent.ctrlKey) {
            //*this.controlPanel()
          }

          if (keyEvent.ctrlKey && keyEvent.altKey) {
            //*if global search open, select to search for date

            //*if file list search open, select to search for date too, it is a different target after all
          }
          
          break;
        case 'f':
          if (keyEvent.ctrlKey) {
            //*this.searchGlobalPanel()
          }
          break;
        case 'g':
          if (keyEvent.ctrlKey) {
            //*this.openThisFile()
          }
          break;
        case 'l':
          if (keyEvent.ctrlKey) {
            //*this.sortSearchCurrentFiles()
          }
          if (keyEvent.ctrlKey && keyEvent.shiftKey) {
            this.forwardHistory()
          }
          break;
        case 'h':
          if (keyEvent.ctrlKey && keyEvent.shiftKey) {
            this.openHistoryView()
          }
          break;
        case 'j':
          if (keyEvent.ctrlKey && keyEvent.shiftKey) {
            this.backHistory()
          }
          break;
        case 'i':
          if (keyEvent.altKey){

          }
          break;
        case 'o':
          if (keyEvent.altKey){

          }
          break;
        case 'n':
          if(this.componentFocus == 'list'){
            if(keyEvent.ctrlKey & keyEvent.shiftKey){
              document.getElementById('temp-file-name').classList.remove('hidden')
              document.getElementById('temp-input').focus()
            }
          }
          break;
        case 'd':
          if(keyEvent.ctrlKey && this.focusTab && this.focusFile){
            this.isDialogOpen = true
          }
          break;
        case 'c':
          if(keyEvent.ctrlKey && this.focusTab && this.focusFile){
            this.singleCopyFile = this.focusFile
            console.log('file copied >>:', this.singleCopyFile);
          }
          break;
        case 'v':
          if(this.singleCopyFile){
            this.copyFileTo(this.singleCopyFile, this.currentDir)
          }
        break;
        case '1':
        if(keyEvent.ctrlKey){
          this.focusAppComponent(0)
        }
          break;
        case '2':
        if(keyEvent.ctrlKey){
          this.focusAppComponent(1)
        }
          break;
        case '3':
        if(keyEvent.ctrlKey){
          this.focusAppComponent(2)
        }
          break;
        default:
          break;
      }
      
    },

    reloadDir(){
      this.fileList = ['']
      this.fileList = this.getDirInfo(this.currentDir)
    },


    copyFileTo(file, destination){
      fs.copyFile(file.filePath, path.join(destination, file.fileName), fs.constants.COPYFILE_EXCL, (err) =>{
        if(err) this.manageCopyError(err);

        console.log('file copied to >>: ', path.join(destination, file.fileName));
      })
      this.reloadDir()
    },

    manageCopyError(err){
      if(err){
        console.log(err);
        //* if error is already exists, prompt the user to 1) cancel de operation 2) copy but add a random set or chars to the copy's name 3) replace the file that already exists
        //* if the error is anything else just show the error type and preview
      }
    },

    focusAppComponent(component){

      if(component == 0){

      }
      if(component == 1){
        NavBar.methods.focusbar()
      }
      if(component == 2){
        this.tabManager = Array.from(document.querySelectorAll('.file-item'))
        this.tabManager[2].focus()
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
  },
  watch:{
    'fileList':{
      handler: function(newValue){
        this.tabManager = Array.from(document.querySelectorAll('.file-item'))
      },
      deep: true
    }
  },
  async created() {
    await this.IPC_GetConfig()

    if(this.appConfig?.homeDirectory){
      this.fileList = this.getDirInfo(this.appConfig.homeDirectory)
      this.dirHistory.push(this.appConfig.homeDirectory)
    }
  },
  async mounted() {

    await this.IPC_GetConfig()

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

    if(this.fileList.length > 2){
      this.tabManager = Array.from(document.querySelectorAll('.file-item'))
    }

    this.currentDir = this.appConfig.homeDirectory
  },
}
</script>

<style>
@import './assets/appStyles.css'
</style>
