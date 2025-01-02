<template>
  <div class="context-menu" id="context-menu" v-show="isShowing" @mouseleave="this.$emit('hideMenu')">
    <ul v-if="context == 'file' || context == 'directory'" class="menu file-context-menu">
      <li class="context-menu-item" @click="this.$emit('openItem', itemFocus.data);this.$emit('hideMenu')">Open</li>
      <li class="context-menu-item" @click="this.$emit('unzipItem', itemFocus);this.$emit('hideMenu')" v-if="isZipped">Unzip</li>
      <li class="context-menu-item" @click="this.$emit('changeItemName', itemFocus);this.$emit('hideMenu')">Change Name</li>
      <li class="context-menu-item" @click="this.$emit('copyItem', itemFocus);this.$emit('hideMenu')">Copy</li>
      <li class="context-menu-item" @click="this.$emit('cutItem', itemFocus);this.$emit('hideMenu')">Cut</li>
      <li class="context-menu-item" @click="this.$emit('deleteItem', itemFocus);this.$emit('hideMenu')">Delete</li>
      <li class="context-menu-item" @click="this.$emit('selectItem', itemFocus);this.$emit('hideMenu')">Select</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ContextMenu',
  data() {
    return {
      menuElement: null,
      contexts: ['file', 'directory','menuOption','navBar','cli','sideBar','fileList'],
      isZipped: false
    }
  },
  props:{
    isShowing:{
      type: Boolean,
      default: false
    },
    mousePos:{
      type: Object,
      default: {posX: 0, posY: 0}
    },
    context:{
      type: String,
      default: null
    },
    itemFocus:{
      type: Object,
      default: {}
    }
  },
  emits:[
    'hideMenu',
    'openItem',
    'changeItemName',
    'copyItem',
    'cutItem',
    'deleteItem',
    'selectItem'
  ],
  mounted() {
  },
  watch:{
    'isShowing':{
      handler: function(newValue){
        if(newValue){
          if(this.itemFocus?.data.extention == '7zip') this.isZipped = true
          if(this.itemFocus?.data.extention == 'rar') this.isZipped = true
          if(this.itemFocus?.data.extention == 'rar4') this.isZipped = true
          if(this.itemFocus?.data.extention == 'zip') this.isZipped = true
          this.showMenu()
        }
      },deep: true
    },
    'itemFocus':{
      handler: function(newValue){
        //console.log(this.itemFocus, 'imtefocus');
      },deep: true
    }
  },
  methods: {
    showMenu(){
      this.menuElement = document.getElementById('context-menu')
      let menu = this.menuElement
      menu.style.position = 'absolute'
      menu.style.top = `${this.mousePos.posY-10}px`
      menu.style.left = `${this.mousePos.posX-10}px`

      //* I have now with this, the item data that is used for the backend side and the html element that has to be modified in certain uses like selection
      //console.log(this.itemFocus.data,this.itemFocus.clickEvent?.target.parentNode);
    }
  },
}
</script>

<style>
.context-menu{
  background-color: var(--light-dark-space);
  color: var(--font-green);
  border: 1px solid var(--font-green);
  z-index: 200;
}

.menu{
  list-style: none;
  padding: 1rem 0;
}

.context-menu-item{
  padding: 0.25rem 1rem;
}

.context-menu-item:hover{
  background-color: var(--dark-space);
  color: var(--font-green-hover);
  cursor: pointer;

}
</style>