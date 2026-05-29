#!/usr/bin/env python3
import argparse
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate one Kokoro WAV file from a brief script.")
    parser.add_argument("input", help="UTF-8 text file containing the spoken brief script")
    parser.add_argument("output", help="WAV file to write")
    parser.add_argument("model", help="Path to kokoro-v1.0.onnx")
    parser.add_argument("voices", help="Path to voices-v1.0.bin")
    parser.add_argument("--voice", default="af_heart", help="Kokoro voice name")
    parser.add_argument("--lang", default="en-us", help="Kokoro language code")
    parser.add_argument("--speed", default=1.0, type=float, help="Speech speed")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)
    model_path = Path(args.model)
    voices_path = Path(args.voices)

    text = input_path.read_text(encoding="utf-8").strip()
    if not text:
        raise SystemExit("input script is empty")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    kokoro = Kokoro(str(model_path), str(voices_path))
    samples, sample_rate = kokoro.create(text, voice=args.voice, speed=args.speed, lang=args.lang)
    sf.write(str(output_path), samples, sample_rate)

    duration_seconds = len(samples) / sample_rate if sample_rate else 0
    print(f"audio_result.output={output_path}")
    print(f"audio_result.sample_rate={sample_rate}")
    print(f"audio_result.duration_seconds={duration_seconds:.3f}")


if __name__ == "__main__":
    main()
