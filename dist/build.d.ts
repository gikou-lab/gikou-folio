import type { DocType, MonthlyData, Theme } from './types.ts';
/** データファイルの項目か（finding の根拠）。"metrics.claims_new" のような名前 */
export declare function refExists(data: MonthlyData, ref: string): boolean;
export declare function build(input: {
    data: MonthlyData;
    body: string;
    docType: DocType;
    theme: Theme;
    builtAt?: string;
}): Promise<string>;
