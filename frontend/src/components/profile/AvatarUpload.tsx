// frontend/src/components/profile/AvatarUpload.tsx
import React, { useState, useRef, ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// ★ 画像圧縮ライブラリをインポート
import imageCompression from 'browser-image-compression';

interface AvatarUploadProps {
    currentImageUrl: string | null; // 現在のアバターURL
    onUpload: (file: File) => Promise<void>; // アップロード処理 (Mutationを呼び出す)
    onDelete: () => Promise<void>;      // 削除処理 (Mutationを呼び出す)
    isUploading: boolean; // アップロード中フラグ
    isDeleting: boolean; // 削除中フラグ
    userName?: string; // Fallback 用
}

// ★★★ サーバーのアップロード上限サイズ（MB単位）★★★
// この値は、Nginx等の設定に合わせてください。例: 2MBなら2、5MBなら5
// この値を超える画像は圧縮を試みます。
const SERVER_MAX_UPLOAD_SIZE_MB = 2; // ← 実際のサーバー上限に合わせて調整してください

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
    // ★ 圧縮処理中の状態を管理するための state を追加 (UI制御に必要)
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        // console.log('[AvatarUpload] useEffect: currentImageUrl changed to', currentImageUrl);
        setPreviewUrl(currentImageUrl);
    }, [currentImageUrl]);

    // ★ async function に変更して圧縮処理を追加
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        // console.log('[AvatarUpload] handleFileChange: Event triggered');
        const originalFile = event.target.files?.[0];
        // console.log('[AvatarUpload] handleFileChange: Selected file object:', originalFile);

        // 圧縮処理中はファイル選択を無視 (念のため)
        if (isProcessing) {
            if (event.target) event.target.value = ''; // input をリセット
            return;
        }

        if (originalFile) {
            // 元のファイルタイプチェック
            if (!originalFile.type.startsWith('image/')) {
                toast({ title: "エラー", description: "画像ファイルを選択してください。", variant: "destructive" });
                if (event.target) event.target.value = '';
                return;
            }

            // ファイルサイズがサーバー上限を超えるかチェック
            if (originalFile.size > SERVER_MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
                setIsProcessing(true); // ★ 処理開始
                toast({
                    title: "画像を処理中...",
                    description: `ファイルサイズを${SERVER_MAX_UPLOAD_SIZE_MB}MB以下に調整します...`,
                });
                try {
                    const options = {
                        maxSizeMB: SERVER_MAX_UPLOAD_SIZE_MB, // ★ 目標最大ファイルサイズ
                        maxWidthOrHeight: 1920,      // ★ 目標最大解像度 (調整可能)
                        useWebWorker: true,
                    };
                    // console.log(`Compressing image: ${originalFile.name}, size: ${originalFile.size} bytes`);
                    const compressedFile = await imageCompression(originalFile, options);
                    // console.log(`Compressed image: ${compressedFile.name}, size: ${compressedFile.size} bytes`);

                    // 圧縮後のファイルで State とプレビューを更新
                    setSelectedFile(compressedFile);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setPreviewUrl(reader.result as string);
                    };
                    reader.readAsDataURL(compressedFile);
                    toast({ title: "成功", description: "画像の準備ができました。" });

                } catch (error) {
                    console.error("Image compression error:", error);
                    toast({ title: "エラー", description: "画像の圧縮に失敗しました。", variant: "destructive" });
                    setSelectedFile(null);
                    setPreviewUrl(currentImageUrl);
                } finally {
                    setIsProcessing(false); // ★ 処理終了
                }
            } else {
                // ファイルサイズが上限内ならそのままセット
                setSelectedFile(originalFile);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(originalFile);
            }
        } else {
            setSelectedFile(null);
            setPreviewUrl(currentImageUrl);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleUploadClick = async () => {
        // console.log('[AvatarUpload] handleUploadClick: Clicked. selectedFile:', selectedFile, 'isUploading:', isUploading);
        // ★ isProcessing でないことも確認
        if (selectedFile && !isUploading && !isProcessing) {
            // console.log('[AvatarUpload] handleUploadClick: Proceeding with upload.');
            try {
                // ★ onUpload には圧縮後(または元の)ファイルが渡される
                await onUpload(selectedFile);
                setSelectedFile(null); // 成功後にリセット
            } catch (error) {
                // console.log('[AvatarUpload] handleUploadClick: Conditions not met for upload.');
                console.error("Upload failed in component:", error);
            }
        }
    };

    const handleDeleteClick = async () => {
         // ★ isProcessing でないことも確認 (削除は圧縮中に関係ないかもしれないが念のため)
         if (currentImageUrl && !isDeleting && !isProcessing) {
             try {
                await onDelete();
                setSelectedFile(null);
             } catch (error) {
                 console.error("Delete failed in component:", error);
             }
         }
    };

    const triggerFileSelect = () => {
        // ★ isProcessing でないことを確認
        if (!isUploading && !isDeleting && !isProcessing) {
            fileInputRef.current?.click();
        }
    };

    const fallbackChar = userName ? userName.charAt(0).toUpperCase() : <User className="h-1/2 w-1/2"/>;

    // ★ ボタンや入力の disabled 状態に isProcessing を追加
    const isDisabled = isUploading || isDeleting || isProcessing;

    return (
        <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-40 w-40 sm:h-40 sm:w-40 border-2 border-muted">
                <AvatarImage src={previewUrl ?? undefined} alt={userName} />
                <AvatarFallback className="text-4xl bg-secondary">{fallbackChar}</AvatarFallback>
            </Avatar>

             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                // accept 属性は元のままでも良いし、'image/*' など広げても良い
                accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/heic,image/heif"
                style={{ display: 'none' }}
                disabled={isDisabled} // ★ 変更
             />

            <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={triggerFileSelect} disabled={isDisabled}> {/* ★ 変更 */}
                     変更
                </Button>

                {selectedFile && (
                    <Button size="sm" onClick={handleUploadClick} disabled={isDisabled}> {/* ★ 変更 */}
                        {(isUploading || isProcessing) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {/* ★ ボタンテキストを状態に応じて変更 */}
                        {isProcessing ? "処理中..." : isUploading ? "送信中..." : "アップロード"}
                    </Button>
                )}

                {currentImageUrl && !selectedFile && (
                     <Button variant="destructive" size="sm" onClick={handleDeleteClick} disabled={isDisabled}> {/* ★ 変更 */}
                         {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                         削除
                     </Button>
                )}
            </div>
             {/* ★ 説明テキストを更新 */}
            <p className="text-xs text-muted-foreground">
                最大{SERVER_MAX_UPLOAD_SIZE_MB}MBまで。超える画像は自動調整されます。
            </p>
        </div>
    );
}