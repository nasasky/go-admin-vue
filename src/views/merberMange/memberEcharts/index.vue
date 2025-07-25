<template>
  <div class="main-box">
    <div class="stats-box">
      <!-- 筛选条件 -->
      <div class="search-box">
        <el-form :model="queryParams" :inline="true" label-width="80px" class="search-form">
          <el-form-item label="统计类型">
            <el-select v-model="queryParams.type" placeholder="请选择统计类型" @change="handleTypeChange" clearable>
              <el-option label="每日统计" value="daily" />
              <el-option label="每周统计" value="weekly" />
              <el-option label="每月统计" value="monthly" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
              clearable
            />
          </el-form-item>
          <el-form-item label="查询天数">
            <el-input-number
              v-model="queryParams.days"
              :min="1"
              :max="365"
              placeholder="查询天数"
              @change="handleDaysChange"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch" :loading="loading">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <el-card class="stats-card" shadow="hover">
              <div class="stats-content">
                <div class="stats-icon total-members">
                  <el-icon size="24">
                    <User />
                  </el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ statsData.summary?.total_members || 0 }}</div>
                  <div class="stats-label">总会员数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <el-card class="stats-card" shadow="hover">
              <div class="stats-content">
                <div class="stats-icon new-members">
                  <el-icon size="24">
                    <UserFilled />
                  </el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ statsData.summary?.new_members_in_period || 0 }}</div>
                  <div class="stats-label">新增会员</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <el-card class="stats-card" shadow="hover">
              <div class="stats-content">
                <div class="stats-icon avg-members">
                  <el-icon size="24">
                    <TrendCharts />
                  </el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ statsData.summary?.avg_daily_new_members?.toFixed(2) || '0.00' }}</div>
                  <div class="stats-label">日均新增</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <el-card class="stats-card" shadow="hover">
              <div class="stats-content">
                <div class="stats-icon growth-rate">
                  <el-icon size="24">
                    <DataLine />
                  </el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ statsData.summary?.growth_rate?.toFixed(2) || '0.00' }}%</div>
                  <div class="stats-label">增长率</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 趋势信息 -->
      <el-card class="trend-card" shadow="never" v-if="statsData.trend_info">
        <template #header>
          <div class="card-header">
            <span class="card-title">趋势分析</span>
            <el-tag 
              :type="getTrendTagType(statsData.trend_info.trend)"
              size="small"
            >
              {{ getTrendText(statsData.trend_info.trend) }}
            </el-tag>
          </div>
        </template>
        <div class="trend-content">
          <p class="trend-desc">{{ statsData.trend_info.trend_desc }}</p>
          <p class="trend-compare">{{ statsData.trend_info.compared_to_prev }}</p>
        </div>
      </el-card>

      <!-- 图表区域 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">会员增长趋势图</span>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color new-members-color"></div>
                <span>新增会员</span>
              </div>
              <div class="legend-item">
                <div class="legend-color total-members-color"></div>
                <span>累计会员</span>
              </div>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <div v-if="loading" class="chart-loading">
            <el-skeleton :rows="8" animated />
          </div>
          <v-chart 
            v-else-if="chartOption" 
            :option="chartOption" 
            :style="{ height: '400px' }"
            autoresize
          />
          <div v-else class="chart-empty">
            <el-empty description="暂无数据" />
          </div>
        </div>
      </el-card>

      <!-- 数据更新时间 -->
      <div class="update-time" v-if="statsData.updated_at">
        <el-text size="small" type="info">
          数据更新时间：{{ statsData.updated_at }}
        </el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Search, Refresh, User, UserFilled, TrendCharts, DataLine } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import { getMemberStats } from '@/api/modules/merberMange';
import type { IMember } from '@/api/interface/merberMange/member';

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
]);

defineOptions({
  name: 'MemberStats'
});

// 加载状态
const loading = ref(false);

// 查询参数
const queryParams = reactive<IMember.StatsQuery>({
  type: 'daily',
  days: 30
});

// 日期范围
const dateRange = ref<string[]>([]);

// 统计数据
const statsData = ref<IMember.StatsData>({
  type: '',
  date_range: {
    start_date: '',
    end_date: '',
    total_days: 0,
    current_date: ''
  },
  summary: {
    total_members: 0,
    new_members_in_period: 0,
    avg_daily_new_members: 0,
    peak_new_members_day: '',
    peak_new_members_count: 0,
    growth_rate: 0
  },
  chart_data: [],
  trend_info: {
    trend: 'stable',
    trend_percent: 0,
    trend_desc: '',
    compared_to_prev: ''
  },
  updated_at: ''
});

// 图表配置
const chartOption = computed(() => {
  if (!statsData.value.chart_data || statsData.value.chart_data.length === 0) {
    return null;
  }

  const dates = statsData.value.chart_data.map(item => item.formatted_date);
  const newMembers = statsData.value.chart_data.map(item => item.new_members);
  const totalMembers = statsData.value.chart_data.map(item => item.total_members);

  return {
    title: {
      text: '会员增长趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function(params: any) {
        const data = params[0];
        const newMembersData = params[0];
        const totalMembersData = params[1];
        
        return `
          <div style="padding: 8px;">
            <div style="margin-bottom: 8px; font-weight: bold;">
              ${data.axisValue}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #409EFF; margin-right: 5px;"></span>
              新增会员：${newMembersData.value} 人
            </div>
            <div>
              <span style="display: inline-block; width: 10px; height: 10px; background: #67C23A; margin-right: 5px;"></span>
              累计会员：${totalMembersData.value} 人
            </div>
          </div>
        `;
      }
    },
    legend: {
      data: ['新增会员', '累计会员'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '新增会员数',
        position: 'left',
        axisLabel: {
          formatter: '{value} 人'
        }
      },
      {
        type: 'value',
        name: '累计会员数',
        position: 'right',
        axisLabel: {
          formatter: '{value} 人'
        }
      }
    ],
    series: [
      {
        name: '新增会员',
        type: 'line',
        yAxisIndex: 0,
        data: newMembers,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      },
      {
        name: '累计会员',
        type: 'line',
        yAxisIndex: 1,
        data: totalMembers,
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          color: '#67C23A'
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 0,
        end: 100
      }
    ]
  };
});

// 获取趋势标签类型
const getTrendTagType = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'success';
    case 'down':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取趋势文本
const getTrendText = (trend: string) => {
  switch (trend) {
    case 'up':
      return '上升';
    case 'down':
      return '下降';
    default:
      return '稳定';
  }
};

// 处理统计类型变化
const handleTypeChange = () => {
  handleSearch();
};

// 处理日期范围变化
const handleDateRangeChange = (dates: string[]) => {
  if (dates && dates.length === 2) {
    queryParams.start_date = dates[0];
    queryParams.end_date = dates[1];
    queryParams.days = undefined;
  } else {
    queryParams.start_date = undefined;
    queryParams.end_date = undefined;
  }
};

// 处理查询天数变化
const handleDaysChange = () => {
  queryParams.start_date = undefined;
  queryParams.end_date = undefined;
  dateRange.value = [];
};

// 查询数据
const handleSearch = async () => {
  loading.value = true;
  try {
    const response = await getMemberStats(queryParams);
    statsData.value = response.data;
  } catch (error) {
    ElMessage.error('获取统计数据失败');
    console.error('获取统计数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 重置查询条件
const handleReset = () => {
  queryParams.type = 'daily';
  queryParams.days = 30;
  queryParams.start_date = undefined;
  queryParams.end_date = undefined;
  dateRange.value = [];
  handleSearch();
};

// 初始化
onMounted(() => {
  handleSearch();
});
</script>

<style scoped lang="scss">
.main-box {
  display: flex;
  width: 100%;
  height: 100%;
  
  .stats-box {
    flex: 1;
    
    .search-box {
      margin-bottom: 20px;
      
      .search-form {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        .el-form-item {
          margin-bottom: 18px;
        }
      }
    }
    
    .stats-cards {
      margin-bottom: 20px;
      
      .stats-card {
        margin-bottom: 16px;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .stats-content {
          display: flex;
          align-items: center;
          padding: 20px;
          
          .stats-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            
            &.total-members {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            &.new-members {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            &.avg-members {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            
            &.growth-rate {
              background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }
          }
          
          .stats-info {
            flex: 1;
            
            .stats-value {
              font-size: 28px;
              font-weight: bold;
              color: #303133;
              line-height: 1.2;
              margin-bottom: 4px;
            }
            
            .stats-label {
              font-size: 14px;
              color: #909399;
            }
          }
        }
      }
    }
    
    .trend-card {
      margin-bottom: 20px;
      border-radius: 8px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
      
      .trend-content {
        .trend-desc {
          font-size: 16px;
          color: #303133;
          margin-bottom: 8px;
          line-height: 1.5;
        }
        
        .trend-compare {
          font-size: 14px;
          color: #909399;
          margin: 0;
          line-height: 1.4;
        }
      }
    }
    
    .chart-card {
      margin-bottom: 20px;
      border-radius: 8px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
        
        .chart-legend {
          display: flex;
          gap: 20px;
          
          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .legend-color {
              width: 12px;
              height: 12px;
              border-radius: 2px;
              
              &.new-members-color {
                background: #409EFF;
              }
              
              &.total-members-color {
                background: #67C23A;
              }
            }
          }
        }
      }
      
      .chart-container {
        .chart-loading {
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .chart-empty {
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
    
    .update-time {
      text-align: center;
      margin-top: 20px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .main-box {
    .stats-box {
      .search-box {
        .search-form {
          padding: 16px;
        }
      }
      
      .stats-cards {
        .stats-card {
          .stats-content {
            padding: 16px;
            
            .stats-icon {
              width: 50px;
              height: 50px;
              margin-right: 16px;
            }
            
            .stats-info {
              .stats-value {
                font-size: 24px;
              }
            }
          }
        }
      }
    }
  }
}
</style>