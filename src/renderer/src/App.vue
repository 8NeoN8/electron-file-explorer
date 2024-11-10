<template>
  <main class="main-container">
    <NavBar 
      :currentDir="currentDir" 
      @searchNewDir="fileList = getDirInfo($event), dirHistory.push($event)"
      @setFocus="this.componentFocus = $event"></NavBar>

    <div class="content-container">
  
      <ul v-if="fileList" class="file-list" id="file-list">
        
        <FileListItem :isHeader="true"/>
        
        <FileListItem 
          :isInput="true" 
          :currentDir="currentDir"
          @reloadCurrentDir="this.reloadDir()"
          @sendInputErrorMessage="systemMessage = $event, console.log($event)"
          @sendInputOkMessage="systemMessage = $event, console.log($event)"
        />

        <template v-for="(file, index) in fileList" :key="index">

          <FileListItem
            :fileItem="file"
            :itemIndex="index"
            @setListItemFocus="this.tabManaging($event)"
            @focusListComponent="this.componentFocus = 'list'"
            @openFileOrDir="openFileOrDir()"
          />
          
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
          {{ multiSelection }}

          <br> <br> <br>
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
        <button class="confirm-deletion" @click="IPC_SendToTrash()">Si</button>
        <button class="cancel-deletion" @click="isDialogOpen = !isDialogOpen">No</button>
      </div>

    </dialog>

    <MessageAlert :messageObject="systemMessage"/>

  </main>
</template>

<script>
import NavBar from './components/NavBar.vue';
import { format } from 'date-fns';
import FileListItem from './components/FileListItem.vue';
import MessageAlert from './components/MessageAlert.vue';
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
      singleCopyFile: null,
      singleCutFile: null,
      originalFileName: null,
      fileChangeName: null,
      selectedFiles: [],
      multiSelection: false,
      toCopy: false,
      toCut: false,
      isRKey: false,
      isSKey: false,
      selectionMode: false,
      systemMessage: {
        header: 'File Name Error',
        msg: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo, dolor, quos minus est totam, debitis quo numquam corporis laborum provident nulla. Illo, delectus! Ipsa necessitatibus odit animi ea aut voluptate?',
        type:'error'
      }
    }
  },
  components:{
    NavBar,
    FileListItem,
    MessageAlert
  },
  methods: {
    setFocusStyle(){
      this.focusTab.classList.add('file-item-focus')
    },

    removeFocusStyle(){
      this.focusTab.classList.remove('file-item-focus')
    },

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

          const filePath = path.join(dir,file)
          const fileInfo = fs.statSync(filePath)

          const newFile = {
            filePath: filePath,
            fileName: file,
            isDir: fs.statSync(filePath).isDirectory(),
            size: Math.round(fileInfo.size / 1024),
            birthtime: format(fileInfo.birthtime, "dd/MM/yyyy")
          }

          return newFile
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

    tabManaging(e){
      const event = e[0]
      const file = e[1]
      this.tabManager = Array.from(document.getElementsByClassName('file-list-item'))
      this.focusTab = event.target
      this.focusFile = file
    },

    async IPC_SendToTrash(){
      //'D:\\MIS_NUEVOS_ARCHIVOS\\prueba recycle bin 2'

      console.log(this.multiSelection, this.selectedFiles, this.focusFile.filePath.toString());

      if(!this.multiSelection){
        await window.api.sendToTrash(this.focusFile.filePath)
      }
      
      if(this.multiSelection){
        for (let i = 0; i < this.selectedFiles.length; i++) {
          await window.api.sendToTrash(this.selectedFiles[i].filePath)
        }
      }

      this.isDialogOpen = false
      this.focusFile = null
      this.fileList = this.getDirInfo(this.currentDir)
      this.reloadDir()

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
     const file_list = Array.from(document.querySelectorAll('.file-list-item'))
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
            file_list[1].focus()
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
              console.log(FileListItem);
              FileListItem.methods.focusInput()
            }
          }
          break;
        case 'd':
          if(keyEvent.ctrlKey && this.focusTab && this.focusFile){
            this.isDialogOpen = true
          }
          break;
        case 'c':
          this.toCut = false
          this.toCopy = true
          if(keyEvent.ctrlKey && this.focusTab && this.focusFile && this.multiSelection == false){
            this.singleCopyFile = this.focusFile
            console.log('file copied >>:', this.singleCopyFile);
          }
          break;
        case 'v':
          if(this.singleCopyFile && this.toCopy){
            this.copyFileTo(this.singleCopyFile, this.currentDir)
          }
          if(this.singleCutFile && this.toCopy){
            this.cutFileTo(this.singleCutFile, this.currentDir)
          }
          if(this.multiSelection){
            console.log('HAY MAS DE UN ARCHIVO SELECCIONADO MARPARICION');
            if(this.toCopy){
              console.log('ESTOY MANDANDO A COPIAR UN ARRAY DE ARCHIVOS');
              this.copyFileTo(this.selectedFiles, this.currentDir, this.multiSelection)
            }

            if(this.toCut){
              this.cutFileTo(this.selectedFiles, this.currentDir, this.multiSelection)
            }
          }
          
          break;
        case 'x':
          this.toCopy = false
          this.toCut = true
          if(keyEvent.ctrlKey && this.focusTab && this.focusFile && !this.multiSelection){
            this.singleCutFile = this.focusFile
            console.log('file cut >>:', this.singleCutFile);
          }
          break;
        case 'a':
          if(keyEvent.ctrlKey && keyEvent.shiftKey){
            this.tabManager.forEach(tab => {
              tab.classList.add('file-item-focus')
            })
            this.selectedFiles = this.fileList
          }
          break;
        case 's':
        if(keyEvent.ctrlKey && keyEvent.shiftKey){
          console.log('Selection file>>: ', this.focusFile);
          this.selectedFiles.push(this.focusFile)
          console.log('Selected Files>>:', this.selectedFiles);
        }
          break;
        case 'm':
          if (keyEvent.ctrlKey) {
            if(this.focusTab && this.focusFile){
              this.startRenameProcess()
            }
          }
          break;
        case 'f2':
          if(this.focusTab && this.focusFile){
            this.startRenameProcess()
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

    handleChangeNameInput(event){
      let input = event.target.innerText
      
      input = input.replace(/(\r\n|\n|\r)/gm, "")

      this.fileChangeName = input

      console.log(input);

    },

    startRenameProcess(){

      //* Get the element with the text
      let fileNameField = Array.from(this.focusTab.getElementsByClassName('file-name'))[0]

      //*save the original file name in case of lost focus, cancels the name change
      this.originalFileName = this.focusFile.fileName

      //* make it editable
      fileNameField.setAttribute('contenteditable', true)

      //* focus the field for the name change
      fileNameField.focus()

      //* set the cursor to the end of the text, maybe leave it at the beginning idk
      const range = document.createRange()
      const selection = window.getSelection()
      range.setStart(fileNameField, fileNameField.childNodes.length)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    },

    cancelNameChange(){
      this.focusTab.getElementsByClassName('file-name')[0].innerText = this.originalFileName
    },

    manageNameChange(file, dir){
      let newFileName = this.fileChangeName.replace(/(\r\n|\n|\r)/gm, "")

      let textEl = this.focusTab.getElementsByClassName('file-name')[0]

      const destination = path.join(dir, this.fileChangeName)
      
      fs.rename(file.filePath, destination, (err) =>{
        if(err) console.log(err);
        this.reloadDir()
      })
      
      this.originalFileName = newFileName
      textEl.innerText = newFileName
      textEl.removeAttribute('contenteditable')
      textEl.blur()
      this.focusTab.focus()
      this.fileChangeName = null
      this.originalFileName = null
      this.reloadDir()
    },

    reloadDir(){
      this.fileList = ['']
      this.fileList = this.getDirInfo(this.currentDir)
    },

    copyFileTo(file, destination, multiFile = false){
      if(!multiFile){
        fs.copyFile(file.filePath, path.join(destination, file.fileName), fs.constants.COPYFILE_EXCL, (err) =>{
          console.log('file copied to >>: ', path.join(destination, file.fileName));
          if(err) this.manageCopyError(err);
  
        })
        this.reloadDir()
      }

      if(multiFile){
        console.log('COPIANDO ARRAY DE ARCHIVOS');
        for (let i = 0; i < this.fileList.length; i++) {
          console.log('SE COPIO UN ARCHIVO VERGA');
          fs.copyFile(file[i].filePath, path.join(destination, file[i].fileName), fs.constants.COPYFILE_EXCL, (err) =>{
            if(err) this.manageCopyError(err);
          })
          
        }
        this.reloadDir()
      }
      this.reloadDir()
    },
    
    cutFileTo(file, destination, multiFile = false){

      if(!multiFile){

        const newPath = path.join(destination, file.fileName)
  
        fs.access(newPath, fs.constants.F_OK, (err) => {
          if(err){
            fs.rename(file.filePath, newPath, (err) =>{
              if(err) console.log(err);
            })
            console.log('file cut and pasted');
            this.reloadDir()
          }
  
          if(!err){
            console.log('file already exists at directory>>: ', destination, ' do you want to override? ');
          }
        })
      }


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

  },
  watch:{
    'fileList':{
      handler: function(newValue){
        this.tabManager = Array.from(document.querySelectorAll('.file-item'))
      },
      deep: true
    },
    'selectedFiles':{
      handler: function(newValue){
        console.log(this.selectedFiles);
        if(newValue.length > 1){
          this.multiSelection = true
        }
      },
      deep: true
    },
    '$data': {
      handler: function(newValue){
        //console.log(newValue);
      },
      deep:true
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
      if(e.key.toLowerCase() == 's') this.isSKey = true
      if(e.key.toLowerCase() == 'r') this.isSKey = true
    })
    document.addEventListener('keyup', (e)=>{
      if(e.key.toLowerCase() == 's') this.isSKey = false
      if(e.key.toLowerCase() == 'r') this.isSKey = false
    })

    if(this.fileList.length > 2){
      this.tabManager = Array.from(document.querySelectorAll('.file-item'))
    }

    this.currentDir = this.appConfig.homeDirectory


    //console.log(this.$data)

    /* let test = await window.api.testingMsg()
    console.log(test); */
  },
}
</script>

<style>
@import './assets/appStyles.css';
@import 'primeicons/primeicons.css';
</style>
