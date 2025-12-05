


import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert } from 'react-native';

export const usePdfViewer = () => {
    const [loadingId, setLoadingId] = useState<number | string | null>(null);

    const viewPdf = async (url: string, fileName: string, itemId: number | string) => {
        if (!url) {
            Alert.alert("Error", "Invalid PDF URL");
            return;
        }

        setLoadingId(itemId);

        try {
            // 1. Create a local URI for the file
            // Sanitize the filename to prevent filesystem errors
            const sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
            const fileUri = `${FileSystem.cacheDirectory}${sanitizedFileName}`;

            // 2. Check if the file already exists (Optional optimization)
            const fileInfo = await FileSystem.getInfoAsync(fileUri);

            if (!fileInfo.exists) {
                // 3. Download if it doesn't exist
                console.log(`Downloading ${fileName} to ${fileUri}...`);
                const downloadRes = await FileSystem.downloadAsync(url, fileUri);
                if (downloadRes.status !== 200) {
                    throw new Error("Download failed");
                }
            }

            // 4. Check if Sharing is available (mostly for web safety)
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Error", "Sharing is not available on this device");
                return;
            }

            // 5. Open the System Viewer
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/pdf',
                dialogTitle: `View ${fileName}`,
                UTI: 'com.adobe.pdf' // Helps iOS understand it's a PDF
            });

        } catch (error: any) {
            console.error("PDF View Error:", error);
            Alert.alert("Error", "Could not load the document. Please try again.");
        } finally {
            setLoadingId(null);
        }
    };

    return { viewPdf, loadingId };
};