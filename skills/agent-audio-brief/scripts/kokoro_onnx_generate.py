#!/usr/bin/env python3
import argparse
import re
from pathlib import Path

import soundfile as sf
from kokoro_onnx import SAMPLE_RATE, Kokoro, trim_audio


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate one Kokoro WAV file from a brief script.")
    parser.add_argument("input", help="UTF-8 text file containing the spoken brief script")
    parser.add_argument("output", help="WAV file to write")
    parser.add_argument("model", help="Path to kokoro-v1.0.onnx")
    parser.add_argument("voices", help="Path to voices-v1.0.bin")
    parser.add_argument("--voice", default="af_heart", help="Kokoro voice name")
    parser.add_argument("--lang", default="en-us", help="Kokoro language code")
    parser.add_argument("--speed", default=1.0, type=float, help="Speech speed")
    parser.add_argument(
        "--max-phonemes",
        default=100,
        type=int,
        help="Maximum phonemes per inference batch; lower values reduce peak memory",
    )
    return parser.parse_args()


def split_phonemes(kokoro: Kokoro, phonemes: str, max_phonemes: int) -> list[str]:
    if max_phonemes <= 0:
        return kokoro._split_phonemes(phonemes)

    batches = []
    current = ""
    for word in phonemes.split():
        if current and len(current) + 1 + len(word) > max_phonemes:
            batches.append(current)
            current = word
        else:
            current = f"{current} {word}".strip()

    if current:
        batches.append(current)

    return batches


def split_text_chunks(text: str) -> list[str]:
    chunks = re.findall(r"[^.!?,;:]+[.!?,;:]*", text)
    return [chunk.strip() for chunk in chunks if chunk.strip()]


def write_streaming_wav(
    kokoro: Kokoro,
    text: str,
    output_path: Path,
    voice_name: str,
    speed: float,
    lang: str,
    max_phonemes: int,
) -> tuple[int, int]:
    if voice_name not in kokoro.voices:
        raise SystemExit(f"voice {voice_name} not found")

    voice = kokoro.get_voice_style(voice_name)
    total_samples = 0

    with sf.SoundFile(
        str(output_path),
        mode="w",
        samplerate=SAMPLE_RATE,
        channels=1,
        subtype="PCM_16",
    ) as wav_file:
        for text_chunk in split_text_chunks(text):
            phonemes = kokoro.tokenizer.phonemize(text_chunk, lang)
            for phoneme_batch in split_phonemes(kokoro, phonemes, max_phonemes):
                audio_part, sample_rate = kokoro._create_audio(phoneme_batch, voice, speed)
                audio_part, _ = trim_audio(audio_part)
                wav_file.write(audio_part)
                total_samples += len(audio_part)

    return total_samples, SAMPLE_RATE


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
    sample_count, sample_rate = write_streaming_wav(
        kokoro,
        text,
        output_path,
        args.voice,
        args.speed,
        args.lang,
        args.max_phonemes,
    )

    duration_seconds = sample_count / sample_rate if sample_rate else 0
    print(f"audio_result.output={output_path}")
    print(f"audio_result.sample_rate={sample_rate}")
    print(f"audio_result.duration_seconds={duration_seconds:.3f}")


if __name__ == "__main__":
    main()
