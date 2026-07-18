import { PermissionsAndroid, Platform } from 'react-native';
import AudioRecord from 'react-native-audio-record';
import Pitchfinder from 'pitchfinder';
import { Buffer } from 'buffer';

const SAMPLE_RATE = 22050; // Use lower sample rate for better performance
const detectPitch = Pitchfinder.YIN({ sampleRate: SAMPLE_RATE });

let isInitialized = false;

export const PitchDetectorService = {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // iOS permissions are handled by the system automatically when AudioRecord.start is called
    // But typically you'd use react-native-permissions. We assume it handles or prompts.
    return true;
  },

  init() {
    if (isInitialized) return;
    AudioRecord.init({
      sampleRate: SAMPLE_RATE,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6, // VOICE_RECOGNITION
      wavFile: 'pitch_detect.wav',
    });
    isInitialized = true;
  },

  start(onPitchDetected: (frequency: number | null) => void) {
    if (!isInitialized) {
      this.init();
    }
    AudioRecord.start();
    AudioRecord.on('data', (data: string) => {
      // Decode base64 to buffer
      const buffer = Buffer.from(data, 'base64');
      // Convert PCM int16 to Float32Array (-1 to 1)
      const float32Array = new Float32Array(buffer.length / 2);
      for (let i = 0; i < buffer.length / 2; i++) {
        // Little Endian
        const int16 = buffer.readInt16LE(i * 2);
        float32Array[i] = int16 / 32768.0;
      }
      
      const pitch = detectPitch(float32Array);
      onPitchDetected(pitch);
    });
  },

  stop() {
    if (isInitialized) {
      AudioRecord.stop();
    }
  },
};

export function pitchToNote(frequency: number): string | null {
  if (frequency <= 0) return null;
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const midiNote = Math.round(12 * (Math.log2(frequency / 440)) + 69);
  if (midiNote < 0 || midiNote > 127) return null;
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = noteNames[midiNote % 12];
  return `${noteName}${octave}`;
}
