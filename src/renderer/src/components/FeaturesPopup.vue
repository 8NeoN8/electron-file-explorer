<template>
  <div class="feature-container" v-if="isShowing" @click.self.stop="this.$emit('close')">

    
    <ul class="feature-list">
      <div class="feature-list-close-button" @click="this.$emit('close')">
        Close
      </div>
      <template v-for="(feature, index) in featureList" :key="index">
        <li class="feature-item" v-if="feature.name">
          {{ index+1 }}. {{ feature.name }} - <span :class="{'done-item':feature.state == 'done' ,'not-item':feature.state == 'not started', 'doing-item':feature.state == 'doing'}">{{feature.state}}</span>
        </li>
      </template>
      
    </ul>

  </div>
</template>

<script>
export default {
  name: 'FeaturesPopup',
  data() {
    return {
      featureList:[
        {
          name: 'Feature List',
          state: 'done'
        },
        {
          name: 'file selection',
          state: 'doing'
        },
        {
          name: 'file Crud',
          state: 'doing'
        },
        {
          name: 'Full Mouse Usage',
          state: 'doing'
        },
        {
          name: 'Tag system',
          state: 'not started'
        },
        {
          name: 'file/dir search',
          state: 'not started'
        },
        {
          name: 'SQLite integration',
          state: 'not started'
        },
        {
          name: 'Shortcut list',
          state: 'not started'
        },
        {
          name: 'navBar functionality',
          state: 'doing'
        },
        {
          name: 'navBar navigation',
          state: 'done'
        },
        {
          name: 'shortcut funtionality',
          state: 'doing'
        },
        {
          name: 'History navigation',
          state: 'doing'
        },
        {
          name: 'Open file with default program',
          state: 'done'
        },
        {
          name: 'File/dir action history',
          state: 'not started'
        },
        {
          name: 'copy, cut, delete',
          state: 'doing'
        },
        {
          name: 'Multiselection',
          state: 'not started'
        },
        {
          name: 'Mouse selection controls',
          state: 'doing'
        },
        {
          name: 'Mouse context menu',
          state: 'doing'
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
        {
          name: '',
          state: ''
        },
      ]
    }
  },
  props:{
    isShowing:{
      type: Boolean,
      default: false
    }
  },
  emits:['close']
}
</script>

<style>
@import '../assets/FeaturesPopup.css';
</style>