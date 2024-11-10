<template>

  <div id="message-alert" class="message-alert hidden">

    <div class="message-display" :class="messageObject.ok ? 'ok-message' : 'error-mesage'">

      <div class="message-header">

        <i class="pi" :class="messageObject.type == 'ok' ? 'pi-check-circle' : 'pi-exclamation-circle'"></i>

        <div class="header-title">
          {{ messageObject.header }}
        </div>

      </div>

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
      type: Object,
      default: {
        header: 'File Name Error',
        msg: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo, dolor, quos minus est totam, debitis quo numquam corporis laborum provident nulla. Illo, delectus! Ipsa necessitatibus odit animi ea aut voluptate?',
        type:'error'
      }
    }
  },
  methods: {
    showMessage(){
      const dialog = document.getElementById('message-alert')
      if(dialog.classList.contains('hidden')){
        dialog.classList.remove('hidden')
        setTimeout(() => {
          this.hideMessage()
        }, 3000);
      }
    },
    hideMessage(){
      document.getElementById('message-alert').classList.add('hidden')
    },
  },
  watch:{
    'messageObject':{
      handler: function(newValue){
        if(newValue != {}) this.showMessage()
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
  width: 20rem;
  height: 6rem;
  background-color: white;
}

.message-display{
  display: flex;
  flex-direction: column;
}

.message-header{
 display: flex;
 width: 100%;
 justify-content: space-around;
}

.ok-message{
  background-color: lightgreen;
}

.error-message{
  background-color: lightcoral;
}
</style>