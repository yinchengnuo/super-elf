<script setup>
import { ref, onMounted } from 'vue'

const PROPS = defineProps({
  code: {
    type: String,
    default: '',
  },
})

const EMITS = defineEmits(['update:code'])

const code = ref(null)

onMounted(() => {
  ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.9.6/')
  ace.require('ace/ext/language_tools')
  const editor = ace.edit(code.value)
  editor.setValue(PROPS.code)
  editor.clearSelection()
  editor.session.setMode('ace/mode/javascript')
  const setHeight = () => {
    code.value.style.height = `${editor.getSession().getLength() * 16}px`
    editor.resize();
  }
  setHeight()
  editor.getSession().on('change', () => {
    EMITS('update:code', editor.getValue())
    setHeight()
  })
  editor.setOptions({
    enableLiveAutocompletion: true,
    enableBasicAutocompletion: true,
  })
})
</script>

<template>
  <div ref="code" style="width: calc(100vw - 579px); height: 96px;display: inline-block;"></div>
</template>
