<template>
  <el-table-column
    v-if="column.isShow"
    v-bind="column"
    :align="column.align ?? 'center'"
    :show-overflow-tooltip="column.showOverflowTooltip ?? column.prop !== 'operation'"
  >
    <template #default="scope">
      <template v-if="column._children">
        <TableColumn
          v-for="child in column._children"
          :key="child.prop"
          :column="child"
        />
      </template>
      <template v-else-if="column.render">
        <component :is="column.render" v-bind="scope" />
      </template>
      <template v-else-if="slots[handleProp(column.prop!)]">
        <slot :name="handleProp(column.prop!)" v-bind="scope" />
      </template>
      <template v-else-if="column.tag">
        <el-tag :type="getTagType(column, scope)">
          {{ renderCellData(column, scope) }}
        </el-tag>
      </template>
      <template v-else>
        {{ renderCellData(column, scope) }}
      </template>
    </template>
    <template #header="scope">
      <template v-if="column.headerRender">
        <component :is="column.headerRender" v-bind="scope" />
      </template>
      <template v-else-if="slots[`${handleProp(column.prop!)}Header`]">
        <slot :name="`${handleProp(column.prop!)}Header`" v-bind="scope" />
      </template>
      <template v-else>
        {{ column.label }}
      </template>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { inject, ref, useSlots } from 'vue';
import { filterEnum, formatValue, handleProp, handleRowAccordingToProp } from '@/utils';
import type { ColumnProps, RenderScope } from '@/components/ProTable/interface';

defineOptions({
  name: 'TableColumn'
});

const props = defineProps<{ column: ColumnProps }>();
const slots = useSlots();
const enumMap = inject('enumMap', ref(new Map()));

// 渲染表格数据
const renderCellData = (item: ColumnProps, scope: RenderScope<any>) => {
  return enumMap.value.get(item.prop) && item.isFilterEnum
    ? filterEnum(handleRowAccordingToProp(scope.row, item.prop!), enumMap.value.get(item.prop), item.fieldNames)
    : formatValue(handleRowAccordingToProp(scope.row, item.prop!));
};

// 获取 tag 类型
const getTagType = (item: ColumnProps, scope: RenderScope<any>) => {
  return (
    filterEnum(handleRowAccordingToProp(scope.row, item.prop!), enumMap.value.get(item.prop), item.fieldNames, 'tag') || 'primary'
  );
};
</script>
