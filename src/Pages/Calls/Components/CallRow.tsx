import React, {type MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState} from 'react';
import {format} from 'date-fns';
import styles from '../CallsPage.module.scss';
import {Incoming} from '@/assets/icons/Incoming.tsx';
import {Outgoing} from '@/assets/icons/Outgoing.tsx';
import type {CallRecord} from '@/types/CallTypes.ts';
import {getCallRecord} from "@/api/calls.ts";
import FileSaver from "file-saver";
import {PauseButton} from "@/assets/icons/PauseButton.tsx";
import {PlayButton} from "@/assets/icons/PlayButton.tsx";
import {Download} from "@/assets/icons/Download.tsx";

type Evaluation = {
    key: 'excellent' | 'good' | 'bad' | 'no_script' | 'none';
    label: string | null;
    className: string;
};

const evaluationsList: Evaluation[] = [
    {key: 'excellent', label: 'Отлично', className: 'evaluationExcellent'},
    {key: 'good', label: 'Хорошо', className: 'evaluationGood'},
    {key: 'bad', label: 'Плохо', className: 'evaluationBad'},
    {key: 'no_script', label: 'Скрипт не использован', className: 'evaluationNoScript'},
    {key: 'none', label: null, className: ''},
];

const getRandomEvaluation = (): Evaluation => {
    const random = Math.floor(Math.random() * evaluationsList.length);
    return evaluationsList[random];
};

const formatDuration = (secondsValue: number): string => {
    const minutes = Math.floor(secondsValue / 60);
    const seconds = secondsValue % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const CallRow: React.FC<{ call: CallRecord }> = ({call}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const evaluation = useMemo(() => getRandomEvaluation(), []);

    const handlePlay = async () => {
        try {
            if (!call.record || !call.partnership_id) return;

            const audioBlob = await getCallRecord(call.record, String(call.partnership_id));
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            setIsPlaying(true);
        } catch (error) {
            console.error("Ошибка при загрузке записи:", error);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const onLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
        };
    }, [audioUrl]);

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleSeek = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !progressBarRef.current) return;

        // Если ещё не загружено, просто начинаем воспроизведение
        if (duration === 0) {
            if (!audioUrl) {
                handlePlay();
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
            return;
        }

        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        audioRef.current.currentTime = (clickX / width) * duration;
    };

    const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const hoverTime = (x / width) * duration;
        setHoverTime(hoverTime);
    };

    const handleMouseLeave = () => {
        setHoverTime(null);
    };

    const handleDownload = async () => {
        try {
            if (!call.record || !call.partnership_id) return;

            const audioBlob = await getCallRecord(call.record, String(call.partnership_id));
            const fileName = `call_${call.id}.mp3`;

            // Скачать
            FileSaver.saveAs(audioBlob, fileName);
        } catch (error) {
            console.error("Ошибка при загрузке записи:", error);
        }
    };

    return (
        <tr className={styles.callRow}>
            <td>{call.in_out === 1 ? Incoming : Outgoing}</td>
            <td>{format(new Date(call.date), 'HH:mm')}</td>
            <td>
                <img
                    src={call.person_avatar || '/default-avatar.png'}
                    className={styles.avatar}
                    alt=""
                />
            </td>
            <td className={styles.nameAndPhoneWrapper}>
                <div className={styles.nameAndPhone}>
                    {call.partner_data.name && (
                        <div>{call.partner_data.name}</div>
                    )}
                    <div className={call.partner_data.name ? styles.phone : undefined}>
                        +{call.partner_data.phone}
                    </div>
                </div>
            </td>
            <td className={styles.source}>{call.source || ''}</td>
            <td className={styles.evaluation}>
                {evaluation.label && (
                    <span className={styles[evaluation.className]}>{evaluation.label}</span>
                )}
            </td>
            {call.record ? (
                <td colSpan={2}>
                    <div className={styles.audioPlayerRow}>
                        <div className={styles.callTime}>{formatDuration(call.time)}</div>

                        <button className={styles.playStop} onClick={() => {
                            if (!audioUrl) handlePlay();
                            else {
                                if (audioRef.current) {
                                    if (audioRef.current.paused) {
                                        audioRef.current.play();
                                        setIsPlaying(true);
                                    } else {
                                        audioRef.current.pause();
                                        setIsPlaying(false);
                                    }
                                }
                            }
                        }}>
                            {isPlaying ? PauseButton : PlayButton}
                        </button>

                        <div
                            ref={progressBarRef}
                            className={styles.progressBar}
                            onClick={handleSeek}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div
                                className={styles.progress}
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                            {hoverTime !== null && duration > 0 && (
                                <div
                                    className={styles.tooltip}
                                    style={{
                                        left: `${(hoverTime / duration) * 100}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                    {formatTime(hoverTime)}
                                </div>
                            )}
                        </div>

                        <button className={styles.download} onClick={handleDownload}>{Download}</button>

                        <audio ref={audioRef} src={audioUrl || undefined} autoPlay={isPlaying} />
                    </div>
                </td>
            ) : (
                <td>{formatDuration(call.time)}</td>
            )}
        </tr>
    );
};

export default CallRow;
