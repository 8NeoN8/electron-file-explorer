<template>

  <div id="message-alert" class="message-alert hidden" :class="messageObject.type == 'ok' ? 'ok-message' : 'error-message'">

    <div class="message-header " >

      <i class="pi" :class="messageObject.type == 'ok' ? 'pi-check-circle' : 'pi-exclamation-circle'"></i>

      <div class="header-title">
        {{ messageObject.header }}
      </div>

      <div @click="this.hideMessage()" class="close-button">
        <i class="pi pi-times"></i>
      </div>

    </div>
    <div class="message-display" >


      <div class="message-info">
        {{ messageObject.msg }}
        
      </div>

    </div>

  </div>

</template>

<script>
export default {
  name: 'MessageAlert',
  data() {
    return {
      
    }
  },
  props:{
    messageObject:{
      type: Object
    }
  },
  methods: {
    showMessage(){
      const dialog = document.getElementById('message-alert')
      
      dialog.classList.remove('hidden')
      setTimeout(() => {
        this.hideMessage()
      }, 3000);
    },
    hideMessage(){
      document.getElementById('message-alert').classList.add('hidden')
    },
  },
  watch:{
    'messageObject':{
      handler: function(newValue){
        this.showMessage(newValue)
      },
      deep: true
    }
  }
}
</script>

<style>

.message-alert{
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: 25rem;
  height: 12rem;
  border-radius: 15px;
  overflow: auto;
  padding: 0.5rem;
}

.message-display{
  margin-top: 0.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 9.4rem;
  padding: 0.25rem;
}



.message-header{
 display: flex;
 width: 100%;
 justify-content: space-between;
 height: 1rem;
}

.ok-message{
  background-color: lightgreen;
}

.error-message{
  background-color: rgb(241, 85, 85);
}

.error-message > .message-display{
  background-color: rgb(255, 145, 145);
}

.ok-message > .message-display{
  background-color: rgb(181, 241, 181);
}

.close-button{
  cursor: pointer;
}

</style>