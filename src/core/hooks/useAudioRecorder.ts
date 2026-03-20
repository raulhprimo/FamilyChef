import { useRef, useState, useCallback, useEffect } from 'react';

const MAX_DURATION_MS = 30_000;
const SILENCE_THRESHOLD = 0.01;
const SILENCE_TIMEOUT_MS = 2_000;
const MIN_SPEECH_MS = 800;
const MIN_BLOB_SIZE = 1024;

function getMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
  return 'audio/webm';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix: "data:audio/webm;base64,"
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const silenceStart = useRef<number | null>(null);
  const speechDetected = useRef(false);
  const recordingStart = useRef(0);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveStop = useRef<((base64: string) => void) | null>(null);
  const rejectStop = useRef<((err: Error) => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream.current) {
        stream.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (durationInterval.current) clearInterval(durationInterval.current);
      if (silenceCheckInterval.current) clearInterval(silenceCheckInterval.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setDuration(0);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = mediaStream;

      // Setup analyser for silence detection
      const ctx = new AudioContext();
      audioContext.current = ctx;
      const source = ctx.createMediaStreamSource(mediaStream);
      const anal = ctx.createAnalyser();
      anal.fftSize = 512;
      source.connect(anal);
      analyser.current = anal;

      // Setup recorder
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(mediaStream, { mimeType });
      mediaRecorder.current = recorder;
      audioChunks.current = [];
      speechDetected.current = false;
      silenceStart.current = null;
      recordingStart.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Cleanup
        if (durationInterval.current) clearInterval(durationInterval.current);
        if (silenceCheckInterval.current) clearInterval(silenceCheckInterval.current);
        mediaStream.getTracks().forEach((t) => t.stop());
        ctx.close();

        const blob = new Blob(audioChunks.current, { type: mimeType });

        if (blob.size < MIN_BLOB_SIZE) {
          rejectStop.current?.(new Error('Áudio muito curto'));
          return;
        }

        const base64 = await blobToBase64(blob);
        resolveStop.current?.(base64);
      };

      recorder.start(250); // timeslice for frequent data events
      setIsRecording(true);

      // Duration counter
      durationInterval.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - recordingStart.current) / 1000);
        setDuration(elapsed);

        // Max duration check
        if (elapsed >= MAX_DURATION_MS / 1000) {
          doStop();
        }
      }, 500);

      // Silence detection
      const dataArray = new Float32Array(anal.fftSize);
      silenceCheckInterval.current = setInterval(() => {
        anal.getFloatTimeDomainData(dataArray);
        const rms = Math.sqrt(dataArray.reduce((sum, v) => sum + v * v, 0) / dataArray.length);

        if (rms > SILENCE_THRESHOLD) {
          speechDetected.current = true;
          silenceStart.current = null;
        } else if (speechDetected.current) {
          // Speech was detected, now silence
          if (!silenceStart.current) {
            silenceStart.current = Date.now();
          } else if (Date.now() - silenceStart.current > SILENCE_TIMEOUT_MS) {
            // Check minimum speech duration
            if (Date.now() - recordingStart.current > MIN_SPEECH_MS) {
              doStop();
            }
          }
        }
      }, 100);
    } catch (err) {
      if ((err as Error).name === 'NotAllowedError') {
        setError('Permita acesso ao microfone nas configurações do navegador');
      } else {
        setError('Erro ao acessar microfone');
      }
      throw err;
    }
  }, []);

  function doStop() {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
  }

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      resolveStop.current = resolve;
      rejectStop.current = reject;
      doStop();
    });
  }, []);

  return { startRecording, stopRecording, isRecording, duration, error };
}
