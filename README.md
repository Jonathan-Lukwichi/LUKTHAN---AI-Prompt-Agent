# LUKTHAN - AI Prompt Agent

## Overview
LUKTHAN is a full-stack web application designed to transform rough user ideas into optimized AI prompts. The application leverages a modern tech stack, including React (with Vite and TypeScript) for the frontend and FastAPI with SQLite for the backend.

## Features
- Real-time chat interface for user interaction
- Auto-detection of input domains (research, coding, data science)
- 12+ optimized prompt templates for various tasks
- Quality scoring system for prompts (0-100)
- File upload support for various formats (PDF, DOCX, images, audio)
- Voice input functionality with transcription
- User-friendly settings sidebar for customization
- Insights panel for metrics visualization
- Responsive design with a dark theme

## Tech Stack
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Zustand, React Query
- **Backend**: FastAPI, SQLAlchemy, SQLite, Gemini AI API, SpeechRecognition, pydub

## Project Structure
```
lukthan-ai-prompt-agent
├── backend
│   ├── main.py
│   ├── config.py
│   ├── database
│   │   ├── __init__.py
│   │   ├── models.py
│   │   └── crud.py
│   ├── services
│   │   ├── __init__.py
│   │   ├── prompt_agent.py
│   │   ├── file_processor.py
│   │   └── voice_processor.py
│   ├── routers
│   │   ├── __init__.py
│   │   ├── prompts.py
│   │   ├── files.py
│   │   └── voice.py
│   ├── schemas
│   │   ├── __init__.py
│   │   └── prompt.py
│   ├── requirements.txt
│   └── .env
├── frontend
│   ├── src
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── api
│   │   │   └── client.ts
│   │   ├── components
│   │   │   ├── Layout
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── Chat
│   │   │   │   ├── ChatContainer.tsx
│   │   │   │   ├── UserMessage.tsx
│   │   │   │   ├── AgentResponse.tsx
│   │   │   │   └── InputBar.tsx
│   │   │   ├── Welcome
│   │   │   │   └── WelcomeHero.tsx
│   │   │   └── UI
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── Badge.tsx
│   │   ├── hooks
│   │   │   ├── usePromptAgent.ts
│   │   │   └── useVoiceInput.ts
│   │   ├── stores
│   │   │   └── chatStore.ts
│   │   ├── styles
│   │   │   └── globals.css
│   │   └── types
│   │       └── index.ts
│   ├── public
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env
└── README.md
```

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Create a virtual environment and activate it.
3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the FastAPI application:
   ```
   uvicorn main:app --reload
   ```

### Frontend
1. Navigate to the `frontend` directory.
2. Install the required dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Usage
- Open your browser and navigate to `http://localhost:3000` to access the application.
- Use the chat interface to input your ideas and receive optimized prompts.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.