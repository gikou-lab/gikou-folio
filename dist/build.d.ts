import type { DocType, MonthlyData, Theme } from './types.ts';
/** データファイルの項目か（finding の根拠）。"metrics.claims_new" のような名前 */
export declare function refExists(data: MonthlyData, ref: string): boolean;
export declare const LLMO_TOP = 8;
/** LLMO の観測（質問 × エンジン）を、エンジンごとの上位の引用元に縮める。同数はドメイン名の順 */
export declare function llmoSummary(llmo: NonNullable<MonthlyData['llmo']>): {
    engine: string;
    questions: number;
    top: {
        domain: string;
        count: number;
    }[];
}[];
/** 題（タブ・PDF の題）。名前は使う側のデータ（doc.domain）から。folio は名前を持たない（v0.3.1） */
export declare function documentTitle(doc: {
    type: string;
    month: string;
    domain: string;
}): string;
/** 印刷の各ページの頭の帯（例「FUKUSHI INDEX · DAILY OBSERVATION · 2026-10-13」） */
export declare function runningHead(doc: {
    type: string;
    month: string;
    domain: string;
}): string;
export declare function build(input: {
    data: MonthlyData;
    body: string;
    docType: DocType;
    theme: Theme;
    builtAt?: string;
    /** 出さない節の番号（例 ['04', '05']）。どの節を出すかは使う側が決める（v0.3.1） */
    omit?: readonly string[];
}): Promise<string>;
