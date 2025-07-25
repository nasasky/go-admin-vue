import type { IPageQuery } from '@/api/interface';

export namespace IMember {
  export interface Query extends IPageQuery {
    name?: string;        // 姓名搜索
    phone?: string;       // 手机号搜索
    username?: string;    // 用户名搜索
    user_name?: string;   // 用户昵称搜索
    search?: string;      // 通用搜索关键词
    start_date?: string;  // 开始日期（用于导出）
    end_date?: string;    // 结束日期（用于导出）
    dateRange?: string[]; // 时间范围（用于前端搜索表单）
  }

  export interface Info {
    id: number;
    user_name: string;    // 用户昵称
    avatar?: string;      // 头像
    phone: string;        // 手机号
    name?: string;        // 姓名
    username?: string;    // 用户名
    create_time: string;  // 创建时间
    update_time: string;  // 修改时间
  }

  export interface Form {
    id?: number;
    user_name: string;
    avatar?: string;
    phone: string;
    name?: string;
    username?: string;
  }

  // 会员统计相关接口
  export interface StatsQuery {
    type?: 'daily' | 'weekly' | 'monthly';  // 统计类型
    start_date?: string;  // 开始日期
    end_date?: string;    // 结束日期
    days?: number;        // 查询天数
  }

  export interface DateRange {
    start_date: string;
    end_date: string;
    total_days: number;
    current_date: string;
  }

  export interface Summary {
    total_members: number;
    new_members_in_period: number;
    avg_daily_new_members: number;
    peak_new_members_day: string;
    peak_new_members_count: number;
    growth_rate: number;
  }

  export interface ChartData {
    date: string;
    new_members: number;
    total_members: number;
    day_of_week: string;
    formatted_date: string;
  }

  export interface TrendInfo {
    trend: 'up' | 'down' | 'stable';
    trend_percent: number;
    trend_desc: string;
    compared_to_prev: string;
  }

  export interface StatsData {
    type: string;
    date_range: DateRange;
    summary: Summary;
    chart_data: ChartData[];
    trend_info: TrendInfo;
    updated_at: string;
  }
}