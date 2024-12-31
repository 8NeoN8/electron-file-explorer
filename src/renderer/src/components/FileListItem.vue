<template>

<div class="list-item-container">

  <li v-if="!isInput"
    tabindex="0"
    @click="openFileItem(fileItem)"
    @doubleclick="openFileItem(fileItem)"
    @focus="focusItem($event, fileItem)"
    @keyup.enter.self="openFileItem(fileItem)"
    @blur="rmFileFocus($event.target)"
    @contextmenu="this.$emit('openContext', {clickEvent: $event, data: fileItem})"
    :class="{ 'file-list-item': !isHeader && !isInput,'file-header-item': isHeader}"  
    :id="isHeader ? 'file-list-header' : `file-item-${itemIndex}`"
  >
  
    <div class="file-list-item-component file-number">
      {{ isHeader ? '###' : formattedItemIndex }}
    </div>
    <div class="file-list-item-component file-name">
      <i 
        class="file-icon pi" 
        :class="fileItem.isDir ? 'pi-folder' : 'pi-file'"
      ></i>
      {{ isHeader ? 'Name' : fileItem.fileName }}
    </div>
    <div class="file-list-item-component file-create-date">
      {{ isHeader ? 'CreateDate' : fileItem.birthtime }}
    </div>
    <div class="file-list-item-component file-type">
      {{ isHeader ? 'Type' : fileItem.isDir ? 'Folder' : 'File' }}
    </div>
    <div class="file-list-item-component file-size">
      {{ isHeader ? 'Size' : ( fileItem.size.toString() == '0' && !fileItem.isDir ? `${fileItem.size} KB` : '') }}
    </div>
  
  </li>
  
  <li v-if="isInput" 
    id="file-list-input"
    class="file-input-item hidden"
    
  >
    <input 
      type="text"
      class="file-list-input"
      id="file-list-input" 
      @blur="hideInput()"
      @keypress.enter="CheckAnsSend(fileNameCreation)" 
      @keyup.esc="hideInput()"
      @input="validateInput()"
      v-model="fileNameCreation"
    >
  </li>

</div>


</template>

<script>
export default {
  name: 'FileListItem',
  data() {
    return {
      fileNameCreation: null,
    }
  },
  props:{
    fileItem:{
      type: Object,
      default: {}
    },
    itemIndex:{
      type: Number,
      default: null
    },
    isHeader:{
      type: Boolean,
      default: false
    },
    isInput:{
      type: Boolean,
      default: false
    },
    currentDir:{
      type: String,
      default: null
    }
  },
  emits:[
    'focusListItem',
    'focusListComponent',
    'openFileOrDir',
    'reloadCurrentDir',
    'sendInputErrorMessage',
    'sendInputOkMessage',
    'openContext'
  ],
  computed:{
    formattedItemIndex(){
      const item = this.itemIndex
      if(item < 10){
        return `00${item}`
      }
      if(item > 9 && item < 100){
        return `0${item}`
      }
      if(item > 99){
        return item
      }
    }
  },
  methods: {
    openFileItem(item){
      this.$emit('openFileOrDir', item)
    },
    focusItem(event, item){
      this.$emit('focusListItem',[event,item])
      this.$emit('focusListComponent', 'list')
      /*
       * Check to make this diferently later and rename pls
       * this.setFileFocus($event.target)
      */
    },

    setFileFocus(htmlEl){
      //! used for the multiple selection of files
      htmlEl.classList.add('file-list-item-focus')
    },
    rmFileFocus(htmlEl){
      //! used for the multiple selection of files
      htmlEl.classList.remove('file-list-item-focus')
    },
    hideInput(){
      this.fileNameCreation = null
      document.getElementById('file-list-input').classList.add('hidden')
    },
    focusInput(){
      document.getElementById('file-list-input').classList.remove('hidden')
      document.getElementById('list-input').focus()
    },
    validateInput(){
      let notValidChars = ["'",'<','>',':','"','|','?','*', '\\', '/']

      for (let i = 0; i < notValidChars.length; i++) {
        if(this.fileNameCreation.includes(notValidChars[i])){
          this.fileNameCreation = this.fileNameCreation.replaceAll(notValidChars[i], '')
          const errorMessage = {
            header: 'Naming Error',
            msg: 'The name can not contain any of the following characters ?|\\*/"<>:',
            type: 'error'
          }
          this.$emit('sendInputErrorMessage', errorMessage)
        }
      }
    },
    async CheckAnsSend(){
      const notValidFileNames = ['CON','PRN','AUX','NUL','COM1','COM2','COM3','COM4','COM5','COM6','COM7','COM8','COM9','COM0','LPT1','LPT2','LPT3','LPT4','LPT5','LPT6','LPT7','LPT8','LPT9','LPT0']

      let isNameValid = false
      let isFile = false

      for (let i = 0; i < notValidFileNames.length; i++) {

        if(this.fileNameCreation == notValidFileNames[i]){
          this.$emit('sendInputErrorMessage', {
              header:'Dir name error',
              msg:'Directory can not have that name',
              type: 'error'
            })
          return
        }

        if(this.fileNameCreation.includes('.')){
          const noExtensionFileName = this.fileNameCreation.split('.')[0]

          if(noExtensionFileName == notValidFileNames[i]){
            this.$emit('sendInputErrorMessage', {
              header:'File name error',
              msg:'File can not have that name',
              type: 'error'
            })
            return
          }
        }
        if(i == notValidFileNames.length-1){
          isNameValid = true
        }
      }

      if(this.fileNameCreation.includes('.')) isFile = true

      if(isNameValid){
        let msgStatus = null
        if(isFile){
          msgStatus = await this.IPC_CreateFile(this.currentDir, this.fileNameCreation)
        } 
        if(!isFile){
          msgStatus = await this.IPC_CreateDir(this.currentDir, this.fileNameCreation)
        }

        msgStatus?.type != 'ok' ? this.$emit('sendInputOkMessage', msgStatus) : this.$emit('sendInputErrorMessage', msgStatus)

        this.hideInput()

        this.$emit('reloadCurrentDir')
      }
      
      
    },
    async IPC_CreateFile(dirPath, fileName){
      return await window.api.createFile(dirPath, fileName)
    },
    async IPC_CreateDir(dirPath, fileName){
      return await window.api.createDir(dirPath, fileName)
    },
  },
}
</script>

<style>
@import '../assets/fileListItem.css';
</style>