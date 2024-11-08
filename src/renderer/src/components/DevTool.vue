<template>

  <div class="dev-tool">

    <template v-for="(value, key) in mainPageData" :key="key">
      <div class="key-value-pairs">
        <div class="object-key">
          {{ key }}
        </div>
        <div class="object-value">
          {{ value }}
        </div>
      </div>
      <br>
    </template>

  </div>

</template>

<script>
export default {
  name:'DevTool',
  data() {
    return {
      
    }
  },
  props:{
    mainPageData:{
      type: Object,
      default: null
    }
  }
}
</script>

<style>
.object-key{
  font-weight: bold;
}

.object-value{
  color: blue;
}

.dev-tool{
  background-color: white;
  width: 30%;
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>