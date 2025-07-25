declare module 'vue-echarts' {
  import { DefineComponent } from 'vue';
  
  interface EChartsComponentProps {
    option: any;
    autoresize?: boolean;
    theme?: string;
    initOptions?: any;
    loadingOptions?: any;
    style?: any;
  }
  
  const EChartsComponent: DefineComponent<EChartsComponentProps>;
  export default EChartsComponent;
}

declare module 'echarts/core' {
  export function use(components: any[]): void;
}

declare module 'echarts/renderers' {
  export const CanvasRenderer: any;
}

declare module 'echarts/charts' {
  export const LineChart: any;
  export const BarChart: any;
  export const PieChart: any;
}

declare module 'echarts/components' {
  export const TitleComponent: any;
  export const TooltipComponent: any;
  export const LegendComponent: any;
  export const GridComponent: any;
  export const DataZoomComponent: any;
} 