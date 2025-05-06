// frontend/src/lib/utils.ts (なければ新規作成、あれば追記)
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
// ↓↓↓★ date-fns 関連をインポート ★↓↓↓
import { formatDistanceToNow, parseISO, differenceInDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';
// ↑↑↑★ date-fns 関連をインポート ★↑↑↑

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ↓↓↓★ 相対日時フォーマット関数を追加 ★↓↓↓
/**
 * ISO 8601 形式の日時文字列を相対的な時間文字列に変換します。
 * 例: "5分前", "約2時間前", "昨日", "2023/01/01"
 * 閾値やフォーマットは必要に応じて調整してください。
 * @param dateString ISO 8601 形式の日時文字列 (例: "2023-10-27T10:00:00.000000Z")
 * @returns フォーマットされた相対時間文字列
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) {
    return ''; // null や undefined の場合は空文字を返す
  }
  try {
    const date = parseISO(dateString); // ISO文字列をDateオブジェクトにパース
    const now = new Date();
    const daysAgo = differenceInDays(now, date);

    // 7日以上前なら 'yyyy/MM/dd' 形式
    if (daysAgo >= 7) {
       return format(date, 'yyyy/MM/dd');
    }
    // 1日以上7日未満なら '〇日前' (formatDistanceToNow を使う)
    if (daysAgo >= 1) {
        // formatDistanceToNow は '約〇日前' のようになるので、厳密な日付が良い場合は調整
        return formatDistanceToNow(date, { addSuffix: true, locale: ja });
        // または format(date, 'M月d日') など
    }
    // 1日未満なら '〇分前', '〇時間前'
    return formatDistanceToNow(date, { addSuffix: true, locale: ja });

  } catch (error) {
    console.error("Error formatting date:", error);
    // エラー時は元の文字列ではなく、分かりやすい代替文字列か空文字が良いかも
    return '日時不明';
  }
}
// ↑↑↑★ 相対日時フォーマット関数を追加 ★↑↑↑