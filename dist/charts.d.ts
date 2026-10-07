import type { Bar, MonthlyData } from './types.ts';
/** 横棒。ラベル・棒・値。percentOfFirst で Funnel の通過率も添える */
export declare function hbarSvg(bars: Bar[], opts: {
    title: string;
    percentOfFirst?: boolean;
}): string;
/** Graph 1：月ごとの新しい Claim（棒）と累計（線）。空の月を 0 として描かない——ある月だけ */
export declare function trendSvg(trend: MonthlyData['trend']): string;
