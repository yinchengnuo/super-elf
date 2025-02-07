<script setup>
import { onMounted } from 'vue'

const PROPS = defineProps({
  code: {
    type: String,
    default: '',
  },
})

const EMITS = defineEmits(['update:code'])

function uuid() {
  const tempUrl = URL.createObjectURL(new Blob())
  const uuid = tempUrl.toString()
  URL.revokeObjectURL(tempUrl)
  return uuid.slice(-36)
}
const id = uuid()

onMounted(() => {
  ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.9.6/')
  ace.require("ace/ext/language_tools");
  const editor = ace.edit(id)
  editor.setValue(PROPS.code)
  editor.clearSelection()
  editor.session.setMode('ace/mode/javascript')
  editor.getSession().on('change', () => EMITS('update:code', editor.getValue()))
})
</script>

<template>
  <div :id="id" style="width: calc(100vw - 432px); height: 60px"></div>
</template>
