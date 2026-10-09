export type Metric = {
    value: number | null;
    prev: number | null;
    unit?: string;
};
export type Bar = {
    label: string;
    value: number;
};
/** 月次レポート・日報のデータファイル（Monthly / Daily Observation・データ v0）。数字は締めで確定し、Agent は触らない */
export type MonthlyData = {
    doc: {
        type: DocType;
        /** 期間。月次は 2026-10、日報は 2026-10-08（日報の追加で名前は月のまま） */
        month: string;
        status: 'DRAFT' | 'FINAL';
        domain: string;
        phase: 'PRIVATE TRIAL' | 'PUBLIC';
        updated: string;
        version: string;
        data_fixed_at: string;
        generated_by: string;
        human_checked: boolean;
    };
    /** 02 Key Metrics。キーは本文の finding が参照する名前 */
    metrics: Record<string, Metric & {
        label: string;
    }>;
    /** Graph 1：推移（月次は 12 か月・日報は 30 日。ある期間だけ）。month は期間（日報は日付） */
    trend: {
        month: string;
        new_claims: number;
        total_claims: number;
    }[];
    /** Graph 2：新しい Claim の出どころ */
    origin: Bar[];
    /** Graph 3：Funnel（各段の件数） */
    funnel: Bar[];
    /** Graph 4：題材ごとの新しい Claim */
    by_topic: Bar[];
    /** 04：制作と検証 */
    content: Record<string, Metric & {
        label: string;
    }>;
    /** 05：LLMO。null は未計測 */
    llmo: {
        question: string;
        engine: string;
        cited: string[];
    }[] | null;
    /** 06：Technical Health */
    health: Record<string, Metric & {
        label: string;
    }>;
};
export type DocType = 'monthly-observation' | 'daily-observation';
export type Theme = 'gikou';
