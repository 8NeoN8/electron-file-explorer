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
      @reloadCurrentDir="this.$emit('reloadCurrentDir')"
      @openFileOrDir="this.$emit('openFileOrDir', $event)"
      @focusListItem="this.$emit('focusListItem', $event)"
      @focusListComponent="this.$emit('focusListComponent', $event)"
      @sendInputErrorMessage="this.$emit('sendInputErrorMessage',$event)"
      @sendInputOkMessage="this.$emit('sendInputOkMessage',$event)"
    />

    <template v-for="(file, index) in fileList" :key="index">

      <FileListItem
        :fileItem="file"
        :itemIndex="index"
        @reloadCurrentDir="this.$emit('reloadCurrentDir')"
        @openFileOrDir="this.$emit('openFileOrDir', $event)"
        @focusListItem="this.$emit('focusListItem', $event)"
        @focusListComponent="this.$emit('focusListComponent', $event)"
        @sendInputErrorMessage="this.$emit('sendInputErrorMessage',$event)"
        @sendInputOkMessage="this.$emit('sendInputOkMessage',$event)"
        @openContext="this.$emit('openTargetContext', $event)"
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
  'reloadCurrentDir',
  'openFileOrDir',
  'focusListItem',
  'focusListComponent',
  'sendInputErrorMessage',
  'sendInputOkMessage',
  'openTargetContext'

  ],
  props:{
    fileList:{
      type: Array,
      default: []
    },
    currentDir:{
      type: String,
    },
    homeDirectory:{
      type: String,
    }
  },
  computed: {
    async fileListResolved(){
      return await this.fileList
    }  
  },
  watch:{
    'fileList':{
      handler: async function(newValue){
        console.log(await this.fileListResolved);
      }, deep: true
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