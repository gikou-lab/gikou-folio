export type Metric = {
    value: number | null;
    prev: number | null;
    unit?: string;
};
export type Bar = {
    label: string;
    value: number;
};
/** 月次レポートのデータファイル（Monthly Observation・データ v0）。数字は月締めで確定し、Agent は触らない */
export type MonthlyData = {
    doc: {
        type: 'monthly-observation';
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
    /** Graph 1：12 か月の推移（ある月だけ） */
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
export type DocType = 'monthly-observation';
export type Theme = 'gikou';
