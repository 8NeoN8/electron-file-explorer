<template>

  <ul v-if="fileList" class="file-list" id="file-list">
    
    <div v-if="fileList.length == 0 && homeDirectory" class="prompt-home-dir">
      <h1 class="explorer-title">NeoN Explorer</h1>
      <p class="explorer-description">
        Simple file explorer made with electron, visit the <a href="#" class="description-link">github</a> to know more!
      </p>

      <div class="set-home-dir-call">
        Click <a href="#" class="change-home-dir-link description-link" @click="changeHomeDir()">here</a> to set the home directory the app will open on launch
      </div>

    </div>

    <FileListItem :isHeader="true"/>
        
    <FileListItem 
      :isInput="true" 
      :currentDir="currentDir"
      @reloadCurrentDir="this.reloadDir()"
      @sendInputErrorMessage="showMessage($event)"
      @sendInputOkMessage="showMessage($event)"
    />

    <template v-for="(file, index) in fileList" :key="index">

      <FileListItem
        :fileItem="file"
        :itemIndex="index"
        @setListItemFocus="this.tabManaging($event)"
        @focusListComponent="this.componentFocus = 'list'"
        @openFileOrDir="openFileOrDir($event)"
      />
      
    </template>

  </ul>

</template>

<script>
import FileListItem from './FileListItem.vue';

export default {
  name: 'FileList',
  data() {
    return {
      
    }
  },
  components:{
    FileListItem,
  },
  emits:[

  ],
  props:{
    fileList:{
      type: Array || Promise,
      default: []
    },
    currentDir:{
      type: String,
    },
    homeDirectory:{
      type: String,
    }
  },
  methods: {
    
  },
  created() {
    
  },
  mounted() {
    
  },
}
</script>

<style>
@import '../assets/fileList.css';
</style>