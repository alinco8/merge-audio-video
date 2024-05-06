export class FileReaderAsync {
    static readAsArrayBuffer(file: File) {
        const reader = new FileReader();

        return new Promise<ArrayBuffer>((resolve) => {
            reader.addEventListener('load', () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result);
                } else {
                    throw new Error('result is not arraybuffer');
                }
            });

            reader.readAsArrayBuffer(file);
        });
    }
}
