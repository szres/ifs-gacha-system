# IFS Gacha System

[中文](./README.md) | **English**

A reproducible and verifiable gacha system built for **Ingress First Saturday** events.

![IFS Gacha System Screenshot](./screenshot.jpg)

## What it does

You only need:

- one image file, such as an IFS group photo
- one text string, such as a passcode announced on site

The app hashes both inputs, combines them into a fixed seed, and produces a draw result that can be reproduced and verified later.

## Key features

- SHA-256 hash for the uploaded image
- SHA-256 hash for the input text
- deterministic seed generation
- reproducible pseudo-random draw
- up to **1000** participants
- no duplicate winners in a single draw
- result panel shows image hash, text hash, seed, and winning numbers

## How to use

1. Upload an image for the draw.
2. Enter the passcode or agreed verification text.
3. Enter total participants and number of winners.
4. Click **Start draw**.
5. Publish the hash values, seed, and winning numbers if others need to verify the result.

## Verification

If the same image, text, participant count, and winner count are entered again, the system should generate the exact same:

- image hash
- text hash
- seed
- winning numbers

Any change in the input will change the final result.

## Run locally

```bash
npm install
npm run dev
```

## Suitable scenarios

- IFS event draws
- small public lucky draws
- simple scenarios that require verifiable randomness
