// frontend/src/lib/materializeFile.ts

/**
 * Forces a File (which may be a lazy reference to a cloud-backed
 * content:// URI, e.g. from Google Drive on Android) to be fully
 * read into memory, then returns a fresh in-memory File built from
 * those bytes. Uploading this instead of the original avoids
 * failures caused by the browser trying to stream-read a slow
 * cloud-backed file mid-upload.
 */
export function materializeFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      resolve(new File([buffer], file.name, { type: file.type, lastModified: file.lastModified }));
    };
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsArrayBuffer(file);
  });
}