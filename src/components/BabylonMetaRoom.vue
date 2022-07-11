<template>

  <canvas></canvas>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MetaRoom } from "@/babylon/MetaRoom";

export default defineComponent({
  name: 'BabylonMetaRoom',
  mounted() {
    const canvas = document.querySelector("canvas")!;
    new MetaRoom(canvas);
  }
});
</script>

<style scoped>
canvas {
  width:  100%;
  height: 100%;
}
</style>
