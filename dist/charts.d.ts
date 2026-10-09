import type { Bar, MonthlyData } from './types.ts';
/** 横棒。ラベル・棒・値。percentOfFirst で Funnel の通過率も添える */
export declare function hbarSvg(bars: Bar[], opts: {
    title: string;
    percentOfFirst?: boolean;
}): string;
/**
 * Graph 1：期間ごとの新しい Claim（棒）と累計（線）。空の期間を 0 として描かない——ある期間だけ。
 * 日報は 30 日まで描き、ラベルは MM/DD。棒が 12 を超えるときは、数字を最後の期間だけに付ける（重なるため）
 */
export declare function trendSvg(trend: MonthlyData['trend'], opts?: {
    max?: number;
    title?: string;
    daily?: boolean;
}): string;
