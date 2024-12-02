<template>
  <div class="cli">
    <div class="console-icon">
      {{ currentDir }}
      <i class="pi pi-angle-right"></i>
    </div>
    <input type="text" class="cli-input" v-model="command" @keypress.enter="this.$emits('commandRun', command)">
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
  methods:{

  },
  props:{
    currentDir:{
      type: String,
      default: null
    }
  },
  emits:[
    'commandRun',
    '',
    ''
  ]
}
</script>

<style>
@import '../assets/cli.css';
</style>