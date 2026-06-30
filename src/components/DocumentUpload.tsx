import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import {
  pick,
  types as docTypes,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import { driverApi } from '../api/client';
import { extractErrorMessage } from '../api/errors';
import { useToast } from './Toast';
import { FileUpload } from './FormField';
import {
  ensureCameraPermission,
  ensureGalleryPermission,
} from '../utils/permissions';

// Guess a mime from a file name when the OS reports a generic/empty type.
const mimeFromName = (name?: string | null): string | undefined => {
  if (!name) return undefined;
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return undefined;
  }
};

// Pull a usable asset out of an image-picker response. Returns null when the
// user cancelled or denied permission so the caller can stay quiet.
const assetFromResponse = (r: ImagePickerResponse): Asset | null => {
  if (r.didCancel || r.errorCode) return null;
  const a = r.assets?.[0];
  if (!a?.uri) return null;
  return a;
};

// image-picker assets already carry base64 + mime, so we build the data URI
// directly without a second filesystem read.
const assetToDataUri = (asset: Asset): string | null => {
  if (!asset.base64) return null;
  const mime = asset.type || mimeFromName(asset.fileName) || 'image/jpeg';
  return `data:${mime};base64,${asset.base64}`;
};

// Document-picker results are a content:// (Android) or file:// (iOS) uri. We
// read the bytes via fetch+FileReader — the same blob path RN uses for network
// bodies — and normalise the mime (some Android providers report octet-stream).
const uriToDataUri = async (
  uri: string,
  type?: string | null,
  name?: string | null,
): Promise<string> => {
  const res = await fetch(uri);
  const blob = await res.blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(blob);
  });

  const base64 = dataUrl.split(',')[1] ?? '';
  const reported = type && type !== 'application/octet-stream' ? type : undefined;
  const mime =
    reported ||
    mimeFromName(name) ||
    (blob.type && blob.type !== 'application/octet-stream'
      ? blob.type
      : undefined) ||
    'application/octet-stream';
  return `data:${mime};base64,${base64}`;
};

type DonePayload = { url: string; name: string };

// Picks a document from camera, gallery, or the file manager, uploads it to S3
// via the backend, and hands back the resulting URL. Render `sheet` somewhere in
// the tree and call `start(onDone)` to open the source chooser.
export const useDocumentUpload = () => {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [visible, setVisible] = useState(false);
  const onDoneRef = useRef<(payload: DonePayload) => void>(() => {});

  const start = (onDone: (payload: DonePayload) => void) => {
    if (uploading) return;
    onDoneRef.current = onDone;
    setVisible(true);
  };

  const upload = async (dataUri: string, name: string) => {
    setUploading(true);
    try {
      const res = await driverApi.uploadDocument(dataUri);
      onDoneRef.current({ url: res.data.data.url, name });
    } catch (err: any) {
      toast.error(
        'Upload failed',
        extractErrorMessage(err, 'Please try again.'),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCamera = async () => {
    setVisible(false);
    if (uploading) return;
    // Request CAMERA up front — image-picker won't prompt on its own when the
    // permission is declared in the manifest, it just fails with "permission".
    const allowed = await ensureCameraPermission();
    if (!allowed) {
      toast.error(
        'Camera permission needed',
        'Enable camera access in Settings to capture a document.',
      );
      return;
    }
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 2000,
        maxHeight: 2000,
        saveToPhotos: false,
        includeBase64: true,
      });
      if (res.errorCode === 'permission') {
        toast.error(
          'Camera permission needed',
          'Enable camera access in Settings to capture a document.',
        );
        return;
      }
      const asset = assetFromResponse(res);
      if (!asset) return;
      const dataUri = assetToDataUri(asset);
      if (!dataUri) {
        toast.error('Could not read photo', 'Please try again.');
        return;
      }
      await upload(dataUri, asset.fileName || 'photo.jpg');
    } catch (err: any) {
      toast.error('Could not open camera', extractErrorMessage(err));
    }
  };

  const handleGallery = async () => {
    setVisible(false);
    if (uploading) return;
    const allowed = await ensureGalleryPermission();
    if (!allowed) {
      toast.error(
        'Gallery permission needed',
        'Enable photo access in Settings to pick a document.',
      );
      return;
    }
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 2000,
        maxHeight: 2000,
        selectionLimit: 1,
        includeBase64: true,
      });
      if (res.errorCode === 'permission') {
        toast.error(
          'Gallery permission needed',
          'Enable photo access in Settings to pick a document.',
        );
        return;
      }
      const asset = assetFromResponse(res);
      if (!asset) return;
      const dataUri = assetToDataUri(asset);
      if (!dataUri) {
        toast.error('Could not read image', 'Please try again.');
        return;
      }
      await upload(dataUri, asset.fileName || 'image.jpg');
    } catch (err: any) {
      toast.error('Could not open gallery', extractErrorMessage(err));
    }
  };

  const handleFiles = async () => {
    setVisible(false);
    if (uploading) return;
    try {
      // Restrict to PDFs so the file browser shows PDF documents (not images).
      // Photos go through the Camera / Gallery options instead.
      const [file] = await pick({
        type: [docTypes.pdf],
        allowMultiSelection: false,
      });
      if (!file?.uri) return;
      const dataUri = await uriToDataUri(file.uri, file.type, file.name);
      await upload(dataUri, file.name || 'document');
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      toast.error('Could not open files', extractErrorMessage(err));
    }
  };

  const sheet = (
    <DocSourceSheet
      visible={visible}
      onCamera={handleCamera}
      onGallery={handleGallery}
      onFiles={handleFiles}
      onCancel={() => setVisible(false)}
    />
  );

  return { start, uploading, sheet };
};

// Friendly label for an already-uploaded document whose only reference is the
// S3 URL (e.g. an existing doc loaded from the server).
const nameFromUrl = (url: string): string => {
  try {
    const last = decodeURIComponent(url.split('/').pop() || '').split('?')[0];
    return last || 'Uploaded document';
  } catch {
    return 'Uploaded document';
  }
};

type DocumentUploadFieldProps = {
  label: string;
  value?: string;
  placeholder?: string;
  error?: string;
  containerStyle?: any;
  onChange: (url: string) => void;
};

// Drop-in replacement for the old stub <FileUpload> that actually uploads.
export const DocumentUploadField: React.FC<DocumentUploadFieldProps> = ({
  label,
  value,
  placeholder,
  error,
  containerStyle,
  onChange,
}) => {
  const { start, uploading, sheet } = useDocumentUpload();
  const [pickedName, setPickedName] = useState<string | null>(null);

  const display = uploading
    ? 'Uploading...'
    : pickedName || (value ? nameFromUrl(value) : undefined);

  // Outer container has no gap so the Modal (last child) never adds spacing; the
  // inner view owns the field+error gap. The whole field is one child of the
  // parent's gap-spaced layout.
  return (
    <View style={containerStyle}>
      <View style={{ gap: 7.986 }}>
        <FileUpload
          label={label}
          value={display}
          placeholder={placeholder}
          onPress={() =>
            start(({ url, name }) => {
              setPickedName(name);
              onChange(url);
            })
          }
        />
        {error ? (
          <Text
            className="font-poppins-regular"
            style={{ color: '#DC2626', fontSize: 12 }}>
            {error}
          </Text>
        ) : null}
      </View>
      {sheet}
    </View>
  );
};

const DocSourceSheet: React.FC<{
  visible: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onFiles: () => void;
  onCancel: () => void;
}> = ({ visible, onCamera, onGallery, onFiles, onCancel }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}>
    <Pressable
      onPress={onCancel}
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
      }}>
      <Pressable
        onPress={() => {}}
        style={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 19.992,
          paddingBottom: 20,
          paddingHorizontal: 13,
          gap: 9,
        }}>
        <Text
          className="font-poppins-bold"
          style={{
            color: '#404040',
            fontSize: 16,
            lineHeight: 24,
            textAlign: 'center',
            marginBottom: 7.99,
          }}>
          Upload Document
        </Text>
        <SheetButton label="Take Photo" onPress={onCamera} />
        <SheetButton label="Choose from Gallery" onPress={onGallery} />
        <SheetButton label="Choose File (PDF)" onPress={onFiles} />
        <SheetButton label="Cancel" onPress={onCancel} variant="cancel" />
      </Pressable>
    </Pressable>
  </Modal>
);

const SheetButton: React.FC<{
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'cancel';
}> = ({ label, onPress, variant = 'primary' }) => (
  <Pressable
    onPress={onPress}
    style={{
      height: 47.989,
      borderRadius: 12,
      backgroundColor: variant === 'cancel' ? '#F5F5F5' : '#FFE403',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    }}>
    <Text
      className="font-poppins-semibold"
      style={{
        color: variant === 'cancel' ? '#757575' : '#404040',
        fontSize: 14,
        lineHeight: 20,
      }}>
      {label}
    </Text>
  </Pressable>
);

// Re-export so screens that need a spinner overlay can reflect upload state.
export const UploadingOverlay: React.FC<{ visible: boolean }> = ({ visible }) =>
  visible ? (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          paddingHorizontal: 24,
          paddingVertical: 20,
          alignItems: 'center',
          gap: 10,
        }}>
        <ActivityIndicator color="#E48714" />
        <Text
          className="font-poppins-medium"
          style={{ color: '#404040', fontSize: 13 }}>
          Uploading...
        </Text>
      </View>
    </View>
  ) : null;
