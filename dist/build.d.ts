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
export declare function build(input: {
    data: MonthlyData;
    body: string;
    docType: DocType;
    theme: Theme;
    builtAt?: string;
}): Promise<string>;
