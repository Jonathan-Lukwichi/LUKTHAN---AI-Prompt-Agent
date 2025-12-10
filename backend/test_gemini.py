#!/usr/bin/env python3
"""Test script to verify Gemini API models."""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment
load_dotenv()

# Configure API
api_key = os.getenv("GEMINI_API_KEY", "")
print(f"API Key (first 10 chars): {api_key[:10]}...")
genai.configure(api_key=api_key)

# List available models
print("\n--- Available Models ---")
try:
    for model in genai.list_models():
        if "generateContent" in model.supported_generation_methods:
            print(f"  - {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")

# Test different model names
models_to_try = [
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "models/gemini-pro",
]

print("\n--- Testing Models ---")
for model_name in models_to_try:
    print(f"\nTrying: {model_name}")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello in one word")
        print(f"  SUCCESS: {response.text.strip()}")
        break
    except Exception as e:
        print(f"  FAILED: {str(e)[:80]}...")
