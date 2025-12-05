import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert } from 'react-native';

export const usePdfViewer = () => {
    const [loadingId, setLoadingId] = useState<number | string | null>(null);

    // Helper: Downloads file and returns local URI
    const downloadFile = async (url: string, fileName: string) => {
        const sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
        const fileUri = `${FileSystem.cacheDirectory}${sanitizedFileName}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (!fileInfo.exists) {
            console.log(`Downloading ${fileName} to ${fileUri}...`);
            const downloadRes = await FileSystem.downloadAsync(url, fileUri);
            if (downloadRes.status !== 200) throw new Error("Download failed");
        }
        return fileUri;
    };

    // Action: Share the PDF (System Sheet)
    const sharePdf = async (url: string, fileName: string, itemId: number | string) => {
        if (!url) return Alert.alert("Error", "Invalid URL");
        setLoadingId(itemId);

        try {
            const fileUri = await downloadFile(url, fileName);
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Error", "Sharing not available");
                return;
            }
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/pdf',
                dialogTitle: `Share ${fileName}`,
                UTI: 'com.adobe.pdf'
            });
        } catch (error: any) {
            Alert.alert("Error", `Share failed: ${error.message}`);
        } finally {
            setLoadingId(null);
        }
    };

    return { sharePdf, downloadFile, loadingId };
};