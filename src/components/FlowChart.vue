<template>
  <div ref="chartRef" class="flow-chart"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chartInstance = null
let resizeObserver = null

const initChart = () => {
  if (!chartRef.value) return
  
  try {
    // 如果已存在实例，先销毁
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
    
    chartInstance = echarts.init(chartRef.value, null, {
      renderer: 'canvas', // 强制使用 canvas 渲染器（兼容性更好）
      width: 'auto',
      height: 'auto'
    })
    
    const option = {
      backgroundColor: 'transparent', // 设置背景透明
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
            color: 'rgba(166, 207, 255, 0.8)'
          }
        },
        axisLabel: {
          color: 'rgba(166, 207, 255, 0.8)',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: 'rgba(166, 207, 255, 0.8)',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: 'rgba(207, 218, 232, 0.8)',
          fontSize: 11
        }
      },
      series: [
        {
          name: '在域人员',
          type: 'line',
          data: props.chartData.inside,
          // smooth: true,
          lineStyle: {
            color: '#FF7F50',
            width: 2
          },
          symbol: 'none',
          itemStyle: {
            color: '#FF7F50'
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
          // smooth: true,
          lineStyle: {
            color: '#1F7FED',
            width: 2,
           
          },
          symbol: 'none',
          itemStyle: {
            color: '#1F7FED'
          }
        },
        {
          name: '出去人员',
          type: 'line',
          data: props.chartData.exit,
          // smooth: true,
          lineStyle: {
            color: '#00BD4B',
            width: 2,
           
          },
          symbol: 'none',
          itemStyle: {
            color: '#00BD4B'
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
  
  try {
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
  } catch (err) {
    console.error('ECharts 更新失败:', err)
  }
}

// 监听数据变化
watch(() => props.chartData, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance && !chartInstance.isDisposed()) {
    try {
      chartInstance.resize()
    } catch (err) {
      console.error('ECharts resize 失败:', err)
    }
  }
}

onMounted(() => {
  nextTick(() => {
    initChart()
    
    // 使用 ResizeObserver 代替 window resize（更精确）
    if (chartRef.value && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        handleResize()
      })
      resizeObserver.observe(chartRef.value)
    } else {
      // 降级方案
      window.addEventListener('resize', handleResize)
    }
  })
})

onUnmounted(() => {
  // 清理 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  } else {
    window.removeEventListener('resize', handleResize)
  }
  
  // 销毁 ECharts 实例
  if (chartInstance) {
    try {
      if (!chartInstance.isDisposed()) {
        chartInstance.dispose()
      }
    } catch (err) {
      console.error('ECharts dispose 失败:', err)
    }
    chartInstance = null
  }
  
  console.log('FlowChart 组件已清理')
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
