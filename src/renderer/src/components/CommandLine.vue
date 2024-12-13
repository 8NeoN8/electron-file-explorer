<template>
  <div class="command-line" v-if="isShowing">
    <div class="command-line-info">
      <div class="current-dir-display" @click="copyDirToClipboard()">
        {{ currentDir }}
      </div>
    </div>

    <div class="command-line-input-container">
      <span class="line-start-symbols">>\:</span>
      <input 
        type="text" 
        class="command-line-input" 
        v-model="command" 
        @keypress.enter="this.$emit('commandRun', command)"
      >
    </div>
  </div>
</template>

<script>
export default {
  name:'SemiCli',
  data() {
    return {
      command: null
    }
  },
  props:{
    currentDir:{
      type: String,
      default: null
    },
    isShowing:{
      type: Boolean,
      default: false
    }
  },
  emits:[
    'commandRun',
    '',
    ''
  ],
  methods:{
    copyDirToClipboard(){

    }
  },
}
</script>

<style>
@import '../assets/commandLine.css';
</style>