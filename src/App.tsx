import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react';
import { Dropzone } from './components/Dropzone';
import { FileReaderAsync } from './libs/FileReader';

export const App = () => {
    const [files, setFiles] = useState<{ video?: File; audio?: File }>({});
    const [output, setOutput] = useState('');
    const [progress, setProgress] = useState(0);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    const mergeVideo = async () => {
        console.log(files, ffmpegRef.current);

        if (!files.audio || !files.video || !ffmpegRef.current) return;

        console.log('merge!');

        const audio = await FileReaderAsync.readAsArrayBuffer(files.audio);
        const video = await FileReaderAsync.readAsArrayBuffer(files.video);

        await ffmpegRef.current.writeFile('audio.mp4', new Uint8Array(audio));
        await ffmpegRef.current.writeFile('video.mp4', new Uint8Array(video));

        await ffmpegRef.current.exec([
            '-i',
            'video.mp4',
            '-i',
            'audio.mp4',
            '-c:v',
            'copy',
            '-c:a',
            'aac',
            'output.mp4',
        ]);
        const data = (await ffmpegRef.current.readFile(
            'output.mp4',
        )) as Uint8Array;

        const url = URL.createObjectURL(
            new Blob([data.buffer], { type: 'video/mp4' }),
        );

        console.log(url);
        setOutput(url);
    };

    const onAudioDrop = (files: File[]) => {
        if (!files[0].name.endsWith('.mp4')) return;

        setFiles((_files) => ({ ..._files, audio: files[0] }));
    };
    const onVideoDrop = (files: File[]) => {
        if (!files[0].name.endsWith('.mp4')) return;

        setFiles((_files) => ({ ..._files, video: files[0] }));
    };

    useEffect(() => {
        console.log('ffmpeg');
        if (!ffmpegRef.current) {
            (async () => {
                const ffmpeg = new FFmpeg();

                ffmpeg.on('progress', ({ progress }) => {
                    setProgress(Math.floor(progress * 100));
                });

                console.log('ffmpeg:start', ffmpeg);

                const baseURL = '/@ffmpeg/core@0.12.6/dist/esm';
                await ffmpeg.load({
                    coreURL: await toBlobURL(
                        `${baseURL}/ffmpeg-core.js`,
                        'text/javascript',
                    ),
                    wasmURL: await toBlobURL(
                        `${baseURL}/ffmpeg-core.wasm`,
                        'application/wasm',
                    ),
                    classWorkerURL: '/@ffmpeg/ffmpeg/dist/esm/worker.js',
                });

                ffmpegRef.current = ffmpeg;

                console.log('ffmpeg:end', ffmpeg);
            })();
        }
    }, []);
    useEffect(() => {
        console.log('files');

        mergeVideo();
    }, [files]);

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Dropzone
                    text={`Audio${files.audio ? `\n${files.audio.name}` : ''}`}
                    accept=".mp4"
                    onDrop={onAudioDrop}
                />
                <p style={{ margin: '8px' }}>+</p>
                <Dropzone
                    text={`Video${files.video ? `\n${files.video.name}` : ''}`}
                    accept=".mp4"
                    onDrop={onVideoDrop}
                />
                <p style={{ margin: '8px' }}>=</p>
                {output && (
                    <a href={output} download>
                        download video
                    </a>
                )}
            </div>
            {progress !== 0 && <progress value={progress} max={100} />}
            {output && (
                <video src={output} controls>
                    Not Found
                </video>
            )}
        </>
    );
};
