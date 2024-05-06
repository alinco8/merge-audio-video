import { useDropzone } from 'react-dropzone-esm';
import styles from './style.module.scss';

interface DropzoneProps {
    text: string;
    accept: string;
    onDrop(files: File[]): void;
}
export const Dropzone = ({ text, accept, onDrop }: DropzoneProps) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    return (
        <div
            {...getRootProps()}
            className={[
                styles.dropzone,
                isDragActive ? styles.active : '',
            ].join(' ')}
        >
            <input type="file" accept={accept} {...getInputProps()} />
            {text}
        </div>
    );
};
