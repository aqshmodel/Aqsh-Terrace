// frontend/src/components/profile/AvatarUpload.tsx
import React, { useState, useRef, ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // ファイル選択用に使うかも
import { Loader2, Upload, Trash2, User } from 'lucide-react'; // アイコン追加
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
    currentImageUrl: string | null; // 現在のアバターURL
    onUpload: (file: File) => Promise<void>; // アップロード処理 (Mutationを呼び出す)
    onDelete: () => Promise<void>;      // 削除処理 (Mutationを呼び出す)
    isUploading: boolean; // アップロード中フラグ
    isDeleting: boolean; // 削除中フラグ
    userName?: string; // Fallback 用
}

export function AvatarUpload({
    currentImageUrl,
    onUpload,
    onDelete,
    isUploading,
    isDeleting,
    userName = 'User'
}: AvatarUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // 親コンポーネントから currentImageUrl が変更されたらプレビューも更新
    React.useEffect(() => {
        setPreviewUrl(currentImageUrl);
    }, [currentImageUrl]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // ファイルタイプとサイズの簡易チェック (サーバー側でもバリデーション必須)
            if (!file.type.startsWith('image/')) {
                toast({ title: "エラー", description: "画像ファイルを選択してください。", variant: "destructive" });
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB 制限 (サーバー側と合わせる)
                 toast({ title: "エラー", description: "画像サイズは2MB以下にしてください。", variant: "destructive" });
                return;
            }

            setSelectedFile(file);
            // プレビューURLを生成
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // キャンセルされた場合など
            setSelectedFile(null);
            setPreviewUrl(currentImageUrl); // プレビューを元に戻す
        }
         // 同じファイルを選択し直せるように input の value をリセット
         if (event.target) {
             event.target.value = '';
         }
    };

    const handleUploadClick = async () => {
        if (selectedFile && !isUploading) {
            try {
                await onUpload(selectedFile);
                // 成功時は ProfileEditPage の onSuccess でキャッシュが更新され、
                // currentImageUrl prop が変わり、useEffect で previewUrl が更新される想定
                setSelectedFile(null); // 選択状態をリセット
            } catch (error) {
                // エラーは onUpload を呼び出す Mutation 側で処理される想定
                console.error("Upload failed in component:", error);
            }
        }
    };

    const handleDeleteClick = async () => {
         if (currentImageUrl && !isDeleting) { // 現在画像がある場合のみ
             try {
                await onDelete();
                // 成功時は ProfileEditPage の onSuccess でキャッシュが更新され、
                // currentImageUrl prop が null になり、useEffect で previewUrl が更新される想定
                setSelectedFile(null); // 選択状態もリセット
             } catch (error) {
                 console.error("Delete failed in component:", error);
             }
         }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const fallbackChar = userName ? userName.charAt(0).toUpperCase() : <User className="h-1/2 w-1/2"/>;

    return (
        <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-25 w-25 sm:h-25 sm:w-25 border-2 border-muted">
                {/* プレビューまたは現在の画像を表示 */}
                <AvatarImage src={previewUrl ?? undefined} alt={userName} />
                {/* フォールバック */}
                <AvatarFallback className="text-4xl bg-secondary">{fallbackChar}</AvatarFallback>
            </Avatar>

             {/* 隠しファイル入力 */}
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif, image/webp" // 許可する形式
                style={{ display: 'none' }}
             />

            <div className="flex space-x-2">
                {/* 変更/選択ボタン */}
                <Button variant="outline" size="sm" onClick={triggerFileSelect} disabled={isUploading || isDeleting}>
                     変更
                </Button>

                {/* アップロードボタン (ファイル選択時のみ表示) */}
                {selectedFile && (
                    <Button size="sm" onClick={handleUploadClick} disabled={isUploading || isDeleting}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        アップロード
                    </Button>
                )}

                {/* 削除ボタン (現在画像があり、ファイル未選択の場合) */}
                {currentImageUrl && !selectedFile && (
                     <Button variant="destructive" size="sm" onClick={handleDeleteClick} disabled={isUploading || isDeleting}>
                         {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                         削除
                     </Button>
                )}
            </div>
            <p className="text-xs text-muted-foreground">推奨サイズ: 200x200px, 最大2MB</p>

        </div>
    );
}