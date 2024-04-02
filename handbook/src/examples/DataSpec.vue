<script setup lang="ts">
import type { basic } from 'custodian'
import { Button, Col, ListItem, Row } from 'ant-design-vue'
import { useResourceFetch } from '@/composables/resources'

const { name, type } = defineProps<{ name: string, type: basic.Data['type'] }>()
const { version, update, err, upgrade } = useResourceFetch(type)
</script>

<template>
  <div v-if="err">
    {{ err }}
  </div>
  <ListItem>
    <Row>
      <Col :span="2">
        {{ name }}
      </Col>
      <Col :span="2">
        {{ version }}
      </Col>
      <Col>
        <Button :disabled="!update" @click="upgrade">
          Fetch
        </Button>
      </Col>
    </Row>
  </ListItem>
</template>

<style scoped>

</style>
