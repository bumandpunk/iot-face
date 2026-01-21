<template>
  <div ref="chartRef" class="flow-chart"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return
  
  try {
    chartInstance = echarts.init(chartRef.value, null, {
      renderer: 'canvas', // 强制使用 canvas 渲染器（兼容性更好）
      width: 'auto',
      height: 'auto'
    })
    
    const option = {
      animation: false, // 禁用动画以提高性能
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: props.chartData.times,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: '#eee',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      series: [
        {
          name: '在域人员',
          type: 'line',
          data: props.chartData.inside,
          smooth: true,
          lineStyle: {
            color: '#ff7f50',
            width: 3
          },
          itemStyle: {
            color: '#ff7f50'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 127, 80, 0.3)' },
                { offset: 1, color: 'rgba(255, 127, 80, 0.05)' }
              ]
            }
          }
        },
        {
          name: '进入人员',
          type: 'line',
          data: props.chartData.enter,
          smooth: true,
          lineStyle: {
            color: '#4a90e2',
            width: 3,
            type: 'dashed'
          },
          itemStyle: {
            color: '#4a90e2'
          }
        },
        {
          name: '出去人员',
          type: 'line',
          data: props.chartData.exit,
          smooth: true,
          lineStyle: {
            color: '#52c41a',
            width: 3,
            type: 'dashed'
          },
          itemStyle: {
            color: '#52c41a'
          }
        }
      ]
    }
    
    chartInstance.setOption(option)
  } catch (err) {
    console.error('ECharts 初始化失败:', err)
  }
}

const updateChart = () => {
  if (!chartInstance) return
  
  chartInstance.setOption({
    xAxis: {
      data: props.chartData.times
    },
    series: [
      { data: props.chartData.inside },
      { data: props.chartData.enter },
      { data: props.chartData.exit }
    ]
  })
}

// 监听数据变化
watch(() => props.chartData, updateChart, { deep: true })

// 监听窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.flow-chart {
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
}
</style>
