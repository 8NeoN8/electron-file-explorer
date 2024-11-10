<template>

<div>

  <li v-if="!isInput"
    tabindex="0"  
    @blur="rmFileFocus($event.target)"
    @keyup.enter.self="this.$emit('openFileOrDir', fileItem)"
    @click="this.$emit('openFileOrDir', fileItem)"
    @focus="
      this.$emit('setListItemFocus',[$event,fileItem]), 
      this.$emit('focusListComponent'),
      setFileFocus($event.target)
    "
    :class="{
      'file-list-item': !isHeader && !isInput, 
      'file-header-item': isHeader
    }"
  
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
      {{ isHeader ? 'CreationDate' : fileItem.birthtime }}
    </div>
    <div class="file-list-item-component file-type">
      <!-- <i 
        v-if="!isHeader"
        class="file-icon pi" 
        :class="fileItem.isDir ? 'pi-folder' : 'pi-file'"
      ></i> -->
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
      id="list-input" 
      @blur="hideInput()" 
      @keypress.enter="CheckAnsSend(fileNameCreation)" 
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
    'setListItemFocus',
    'focusListComponent',
    'openFileOrDir',
    'sendInputErrorMessage',
    'sendInputOkMessage',
    'reloadCurrentDir'
  ],
  computed:{
    formattedItemIndex(){
      if(this.itemIndex < 10){
        return `00${this.itemIndex}`
      }
      if(this.itemIndex > 9 && this.itemIndex < 100){
        return `0${this.itemIndex}`
      }
      if(itemIndex > 99){
        return this.itemIndex
      }
    }
  },
  methods: {
    setFileFocus(htmlEl){
      htmlEl.classList.add('file-list-item-focus')
    },
    rmFileFocus(htmlEl){
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
          this.$emit('sendInputErrorMessage', `Filename can not have any of these symbols ?|\\*/"'<>:`)
          return
        }
      }
    },
    async CheckAnsSend(){
      const notValidFileNames = ['CON','PRN','AUX','NUL','COM1','COM2','COM3','COM4','COM5','COM6','COM7','COM8','COM9','COM0','LPT1','LPT2','LPT3','LPT4','LPT5','LPT6','LPT7','LPT8','LPT9','LPT0']

      let isNameValid = false
      let isFile = false

      for (let i = 0; i < notValidFileNames.length; i++) {

        if(this.fileNameCreation == notValidFileNames[i]){
          //!create reactive component to output messages to the user
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
            //!create reactive component to output messages to the user
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
@import '../assets/fileItem.css';
</style>