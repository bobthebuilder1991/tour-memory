"""Read one bounded G2 WAV on stdin and write its local transcript to stdout."""
import io
import json
import os
import sys
import wave
from vosk import KaldiRecognizer, Model, SetLogLevel

SetLogLevel(-1)
with wave.open(io.BytesIO(sys.stdin.buffer.read(600001))) as recording:
    if (recording.getnchannels(), recording.getsampwidth(), recording.getframerate()) != (1, 2, 16000):
        raise ValueError("Expected mono 16-bit 16 kHz PCM")
    recognizer = KaldiRecognizer(Model(os.environ["VOSK_MODEL_PATH"]), 16000)
    words = []
    while chunk := recording.readframes(4000):
        if recognizer.AcceptWaveform(chunk):
            words.append(json.loads(recognizer.Result())["text"])
    words.append(json.loads(recognizer.FinalResult())["text"])
    print(" ".join(filter(None, words)))
