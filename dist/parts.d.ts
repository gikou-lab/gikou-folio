import type { Metric, MonthlyData } from './types.ts';
export declare function documentHeader(doc: MonthlyData['doc']): string;
export declare function section(num: string, title: string, inner: string): string;
export declare function metric(key: string, m: Metric & {
    label: string;
}, prevLabel?: string, noPrev?: string): string;
export declare function metricGroup(group: string, metrics: Record<string, Metric & {
    label: string;
}>, prevLabel?: string, noPrev?: string): string;
export declare function chart(num: number, title: string, svg: string, caption: string, ref: string): string;
export declare function table(head: string[], rows: string[][], ref: string): string;
export declare function finding(inner: string, refs: string[]): string;
export declare function action(inner: string, status: string): string;
export declare function documentFooter(doc: MonthlyData['doc'], builtAt: string): string;
