export declare const SECTION_NUMBERS: readonly ['01', '02', '03', '04', '05', '06', '07'];
/** 本文ファイル → セクション番号ごとの HTML。refExists でデータファイルの項目かを確かめる */
export declare function parseBody(md: string, refExists: (ref: string) => boolean): Promise<Map<string, string>>;
