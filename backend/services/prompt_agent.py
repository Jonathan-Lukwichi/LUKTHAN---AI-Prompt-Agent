from typing import Dict, Any, Optional, List
import anthropic
import os
import re
import json
import asyncio
from datetime import datetime
from dotenv import load_dotenv

# Domain to task type mapping (inline definitions)
domain_tasks = {
    "coding": ["code_generation", "debugging", "code_review", "architecture", "api_design"],
    "research": ["literature_review", "paper_writing", "methodology", "explanation"],
    "data_science": ["data_analysis", "ml_model", "data_visualization"],
    "general": ["general_query", "writing_assistance", "brainstorming"]
}

# Task type keywords for detection
task_keywords = {
    "code_generation": ["write", "create", "implement", "build", "develop", "code", "function", "class", "program"],
    "debugging": ["debug", "fix", "error", "bug", "issue", "problem", "not working", "crash", "exception"],
    "code_review": ["review", "check", "analyze code", "improve", "optimize", "refactor"],
    "architecture": ["design", "architect", "structure", "system", "scalable", "microservice"],
    "api_design": ["api", "endpoint", "rest", "graphql", "route", "request", "response"],
    "literature_review": ["literature", "review", "papers", "research", "studies", "academic"],
    "paper_writing": ["paper", "thesis", "dissertation", "essay", "article", "publication"],
    "methodology": ["method", "methodology", "approach", "procedure", "study design"],
    "explanation": ["explain", "what is", "how does", "understand", "concept", "theory"],
    "data_analysis": ["analyze", "data", "statistics", "trends", "patterns", "insights",
                      "csv", "clean", "cleaning", "missing", "null", "preprocess", "preprocessing",
                      "eda", "exploratory", "leakage", "leak", "correlation", "distribution"],
    "ml_model": ["machine learning", "ml", "model", "predict", "classification", "regression", "neural",
                 "lstm", "xgboost", "random forest", "gradient boosting", "lightgbm", "catboost",
                 "train", "training", "validation", "hyperparameter", "forecast", "forecasting",
                 "deep learning", "tensorflow", "pytorch", "keras", "sklearn", "scikit"],
    "data_visualization": ["visualize", "chart", "graph", "plot", "dashboard", "visualization"],
    "general_query": ["help", "question", "information", "tell me", "what", "how", "why"],
    "writing_assistance": ["write", "draft", "content", "copy", "blog", "email", "message"],
    "brainstorming": ["ideas", "brainstorm", "suggest", "creative", "options", "possibilities"]
}

# Programming language detection keywords
language_keywords = {
    "python": ["python", "py", "django", "flask", "pandas", "numpy", "pytorch", "tensorflow"],
    "javascript": ["javascript", "js", "node", "react", "vue", "angular", "express", "npm"],
    "typescript": ["typescript", "ts", "angular", "nest", "deno"],
    "java": ["java", "spring", "maven", "gradle", "jvm", "kotlin"],
    "csharp": ["c#", "csharp", ".net", "dotnet", "asp.net", "unity"],
    "cpp": ["c++", "cpp", "cmake", "qt", "boost"],
    "go": ["golang", "go ", "gin", "fiber"],
    "rust": ["rust", "cargo", "tokio"],
    "php": ["php", "laravel", "symfony", "wordpress"],
    "ruby": ["ruby", "rails", "sinatra"],
    "swift": ["swift", "ios", "swiftui", "uikit"],
    "sql": ["sql", "mysql", "postgresql", "database", "query", "select", "insert"]
}

# Minimal fallback template for prompt generation (used when AI optimization fails)
templates = {
    "general_query": """You are a knowledgeable assistant providing comprehensive and accurate information.

**Task:** {user_request}

**Response Guidelines:**
1. Provide accurate, well-researched information
2. Structure the response clearly
3. Include relevant examples
4. Acknowledge limitations or uncertainties

**Context:** {context}

**Output Format:**
- Direct answer to the query
- Supporting details and examples
- Practical applications"""
}

# Load environment variables from the correct path
import pathlib
env_path = pathlib.Path(__file__).parent.parent / '.env'
print(f"[LUKTHAN] Loading .env from: {env_path}")
load_dotenv(dotenv_path=env_path)

# Configure Anthropic API
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Fallback: if still empty, try direct path
if not ANTHROPIC_API_KEY:
    try:
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('ANTHROPIC_API_KEY='):
                    ANTHROPIC_API_KEY = line.strip().split('=', 1)[1]
                    break
    except Exception:
        pass  # Will be caught when trying to use the API

# Claude model configuration (configurable via environment variable)
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-5-haiku-20241022")

# Domain-specific expert consultant prompts for GUIDED mode
EXPERT_CONSULTANTS = {
    "coding": {
        "role": "Senior Software Architect & Coding Expert",
        "welcome": "I'm your Senior Software Architect consultant. Let's build the perfect prompt for your coding task together.\n\n**To get started, tell me:** What are you trying to build or fix? (e.g., 'a REST API endpoint', 'debug a React component', 'optimize database queries')",
        "system_prompt": """You are LUKTHAN, a Senior Software Architect with 20+ years of experience helping developers craft perfect AI prompts for coding tasks.

YOUR PERSONALITY:
- Warm, encouraging, but technically precise
- Like a senior mentor guiding a developer
- Ask smart follow-up questions based on what user tells you

YOUR APPROACH:
1. Listen carefully to what the user says
2. Ask ONE focused, relevant follow-up question at a time
3. Build on previous answers - don't repeat questions
4. After 3-4 exchanges, when you have enough context, say "Perfect! I have enough information to create your optimized prompt."

SMART QUESTIONS TO CONSIDER (pick based on context):
- Programming language/framework they're using
- Type of task (new feature, bug fix, refactoring, architecture, testing)
- Current codebase context or constraints
- Expected output format (code, explanation, review)
- Any specific libraries or patterns they prefer

BE SMART: If the user already mentioned Python, don't ask "what language?" - instead ask about their Python version or the specific library.

Keep responses SHORT (2-3 sentences max) and end with ONE clear question.""",
    },
    "data_science": {
        "role": "Lead Data Scientist & ML Expert",
        "welcome": "I'm your Lead Data Scientist consultant. Let's craft the perfect prompt for your data project.\n\n**To get started, tell me:** What's your data challenge? (e.g., 'predict customer churn', 'analyze sales trends', 'build a recommendation system')",
        "system_prompt": """You are LUKTHAN, a Lead Data Scientist with deep expertise in ML, statistics, and data analysis, helping users craft perfect AI prompts.

YOUR PERSONALITY:
- Collaborative and educational
- Excited about data problems
- Helps users think through their data scientifically

YOUR APPROACH:
1. Listen to the user's data challenge
2. Ask ONE smart follow-up question at a time
3. Build context progressively - reference previous answers
4. After 3-4 exchanges, when you understand the problem well, say "Excellent! I have enough information to create your optimized prompt."

SMART QUESTIONS TO CONSIDER (pick based on context):
- Type of analysis (EDA, ML model, visualization, data cleaning, feature engineering)
- Dataset characteristics (size, features, format, quality)
- Business problem or research question
- Preferred algorithms or techniques
- Desired output (code, insights, visualization, report)

BE SMART: If user mentions "CSV with 10k rows", don't ask about data format - ask about specific features or the target variable.

Keep responses SHORT (2-3 sentences max) and end with ONE clear question.""",
    },
    "ai_builder": {
        "role": "AI/ML Solutions Architect",
        "welcome": "I'm your AI Solutions Architect. Let's design the perfect prompt for your AI project.\n\n**To get started, tell me:** What AI system are you building? (e.g., 'a customer support chatbot', 'an AI agent for code review', 'a RAG pipeline')",
        "system_prompt": """You are LUKTHAN, an AI/ML Solutions Architect specializing in building production AI applications, helping users craft perfect prompts.

YOUR PERSONALITY:
- Visionary but practical
- Excited about AI possibilities
- Helps users think through AI system design

YOUR APPROACH:
1. Understand their AI project vision
2. Ask ONE strategic question at a time
3. Build on their answers progressively
4. After 3-4 exchanges, say "Great! I have enough information to create your optimized prompt."

SMART QUESTIONS TO CONSIDER (pick based on context):
- Type of AI system (chatbot, agent, pipeline, fine-tuning, RAG)
- Use case and end users
- Models/APIs they're using (OpenAI, Claude, Gemini, open source)
- Requirements (latency, accuracy, cost, scale)
- Current tech stack and constraints

BE SMART: If user mentions "using Claude API", don't ask about the model - ask about their specific use case or integration needs.

Keep responses SHORT (2-3 sentences max) and end with ONE clear question.""",
    },
    "research": {
        "role": "Academic Research Advisor",
        "welcome": "I'm your Academic Research Advisor. Let's build the perfect prompt for your research work.\n\n**To get started, tell me:** What are you working on? (e.g., 'literature review for my thesis', 'analyzing survey data', 'writing methodology section')",
        "system_prompt": """You are LUKTHAN, an Academic Research Advisor with expertise across multiple disciplines, helping students and researchers craft perfect AI prompts.

YOUR PERSONALITY:
- Supportive and academically rigorous
- Understands academic pressures and deadlines
- Guides researchers with empathy and expertise

YOUR APPROACH:
1. Understand their academic context
2. Ask ONE relevant question at a time
3. Build on their answers - show you're listening
4. After 3-4 exchanges, say "Perfect! I have enough information to create your optimized prompt."

SMART QUESTIONS TO CONSIDER (pick based on context):
- Academic level (Bachelor, Master, PhD, Post-doc)
- Field/discipline and specific area
- Type of work (literature review, methodology, analysis, writing, presentation)
- Research question or thesis focus
- Institutional requirements or supervisor preferences

BE SMART: If user mentions "PhD in machine learning", don't ask their academic level - ask about their specific research question.

Keep responses SHORT (2-3 sentences max) and end with ONE clear question.""",
    },
}


class IntelligentAgent:
    """
    An intelligent AI agent that can:
    1. Detect user intent (prompt optimization vs general conversation)
    2. Think through problems step by step
    3. Have natural conversations about life, philosophy, and general topics
    4. Optimize prompts when requested
    """

    def __init__(self):
        # Use Claude API with configurable model
        self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        # Use model from environment variable
        self.model = CLAUDE_MODEL
        self.conversation_history: List[Dict[str, str]] = []
        print(f"[LUKTHAN] IntelligentAgent initialized with model: {self.model}")

    async def process_message(
        self,
        user_input: str,
        file_content: Optional[str] = None,
        file_type: Optional[str] = None,
        settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main entry point - intelligently process any user message.
        Detects intent and responds appropriately.
        Supports both DIRECT and GUIDED modes.
        """
        settings = settings or {}
        context = file_content or ""
        mode = settings.get("mode", "direct")
        domain = settings.get("domain", "coding")

        # Step 1: Generate thinking process
        thinking_steps = await self._generate_thinking(user_input, context, settings)

        # Step 2: Detect user intent
        intent = self._detect_intent(user_input, context)

        # Step 3: Check if GUIDED mode is active - ALWAYS use guided flow when mode is "guided"
        if mode == "guided":
            # Use domain-specific expert consultant (ignores intent detection)
            result = await self._guided_expert_flow(user_input, context, settings, thinking_steps, domain)
            result["intent"] = "guided"
            result["thinking"] = thinking_steps
            return result

        # Step 4: Process based on intent (DIRECT mode or conversation)
        if intent == "prompt_optimization":
            # User wants to optimize a prompt
            result = await self._optimize_prompt(user_input, context, settings, thinking_steps)
            result["intent"] = "prompt_optimization"
            result["thinking"] = thinking_steps
            return result

        elif intent == "conversation":
            # User wants to have a conversation
            result = await self._have_conversation(user_input, thinking_steps)
            result["intent"] = "conversation"
            result["thinking"] = thinking_steps
            return result

        elif intent == "question":
            # User is asking a question (life, philosophy, general)
            result = await self._answer_question(user_input, thinking_steps)
            result["intent"] = "question"
            result["thinking"] = thinking_steps
            return result

        else:
            # Hybrid - try to help in the most appropriate way
            result = await self._smart_response(user_input, context, settings, thinking_steps)
            result["intent"] = "hybrid"
            result["thinking"] = thinking_steps
            return result

    async def _guided_expert_flow(
        self,
        user_input: str,
        context: str,
        settings: Dict[str, Any],
        thinking_steps: List[Dict],
        domain: str
    ) -> Dict[str, Any]:
        """
        Guided expert consultant flow - asks questions ONE AT A TIME progressively.
        STRICTLY one question per response, no prompts until user says "generate".
        """
        try:
            # Get domain-specific expert configuration
            expert_config = EXPERT_CONSULTANTS.get(domain, EXPERT_CONSULTANTS["coding"])
            expert_role = expert_config["role"]

            # Calculate conversation step (number of exchanges)
            conversation_step = len(self.conversation_history) // 2

            print(f"[LUKTHAN] === GUIDED MODE ===")
            print(f"[LUKTHAN] Domain: {domain}, Step: {conversation_step}, History: {len(self.conversation_history)} messages")
            print(f"[LUKTHAN] User input: {user_input[:50]}...")

            # Check if we should generate final prompt (ONLY on explicit request)
            should_generate = self._should_generate_final_prompt(user_input, self.conversation_history)

            if should_generate and conversation_step >= 2:
                print(f"[LUKTHAN] >>> GENERATING FINAL PROMPT <<<")
                return await self._generate_final_guided_prompt(context, settings, thinking_steps, domain)

            # Store user message in history FIRST
            self.conversation_history.append({
                "role": "user",
                "content": user_input,
                "timestamp": datetime.now().isoformat()
            })

            # Define the SINGLE question to ask based on step
            questions_by_step = {
                "coding": [
                    "What programming language or framework are you working with?",
                    "What specific task do you need help with? (e.g., building a feature, fixing a bug, refactoring)",
                    "Are there any specific requirements or constraints I should know about?",
                    "What format would you like the output in? (e.g., code with comments, step-by-step guide)",
                ],
                "data_science": [
                    "What's the main goal of your analysis? (e.g., prediction, classification, clustering)",
                    "Can you tell me about your dataset? (size, type of data, key features)",
                    "Are there any specific algorithms or techniques you'd like to use?",
                    "What output do you need? (e.g., Python code, insights report, visualization)",
                ],
                "ai_builder": [
                    "What type of AI system are you building? (e.g., chatbot, agent, RAG pipeline)",
                    "What's the main use case or problem you're solving?",
                    "Which AI models or APIs are you planning to use?",
                    "Any specific requirements like latency, cost, or accuracy constraints?",
                ],
                "research": [
                    "What's your field of study and academic level?",
                    "What type of work are you doing? (e.g., literature review, methodology, analysis)",
                    "What's your specific research question or topic?",
                    "Any particular requirements from your institution or supervisor?",
                ],
            }

            domain_questions = questions_by_step.get(domain, questions_by_step["coding"])

            # Determine what to say based on step
            if conversation_step == 0:
                # First interaction - acknowledge and ask first question
                message = f"Great! I'd love to help you with that. {domain_questions[0]}"
            elif conversation_step < len(domain_questions):
                # Ask the next question
                message = f"Got it! {domain_questions[conversation_step]}"
            else:
                # Ready to generate
                message = "Perfect! I have all the information I need. Type **\"generate\"** and I'll create your optimized prompt!"

            print(f"[LUKTHAN] Guided response (step {conversation_step + 1}): {message}")

            # Store assistant response in history
            self.conversation_history.append({
                "role": "assistant",
                "content": message,
                "timestamp": datetime.now().isoformat()
            })

            return {
                "response": message,
                "response_type": "guided",
                "quality_score": 60 + (conversation_step * 10),
                "domain": domain,
                "suggestions": [],
                "metadata": {
                    "expert_role": expert_role,
                    "mode": "guided",
                    "conversation_step": conversation_step + 1,
                    "ready_to_generate": conversation_step >= len(domain_questions)
                }
            }

        except Exception as e:
            print(f"[LUKTHAN] Guided flow error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "response": "I'd love to help! What are you trying to build?",
                "response_type": "guided",
                "quality_score": 50,
                "domain": domain,
                "suggestions": [],
                "metadata": {"error": str(e), "conversation_step": 1}
            }

    def _should_generate_final_prompt(self, user_input: str, history: List[Dict]) -> bool:
        """Check if user EXPLICITLY requested to generate the final prompt."""
        text = user_input.lower().strip()

        # Only explicit triggers - user must clearly ask to generate
        generate_triggers = [
            "generate", "create the prompt", "make the prompt", "build the prompt",
            "create it", "generate it", "make it", "build it",
            "generate prompt", "create prompt", "ready", "go ahead",
            "yes generate", "ok generate", "please generate"
        ]

        for trigger in generate_triggers:
            if trigger in text:
                print(f"[LUKTHAN] Generate trigger detected: '{trigger}'")
                return True

        return False

    async def _generate_final_guided_prompt(
        self,
        context: str,
        settings: Dict[str, Any],
        thinking_steps: List[Dict],
        domain: str
    ) -> Dict[str, Any]:
        """Generate the final optimized prompt based on guided conversation."""
        try:
            # Compile all gathered information from conversation
            conversation_summary = "\n".join([
                f"{'User' if msg['role'] == 'user' else 'Expert'}: {msg['content']}"
                for msg in self.conversation_history[-12:]
            ])

            system_prompt = f"""Based on the conversation below, generate an OPTIMIZED AI PROMPT.

CONVERSATION:
{conversation_summary}

TARGET AI: {settings.get('target_ai', 'ChatGPT (GPT-4)')}
DOMAIN: {domain.replace('_', ' ').title()}

Generate a comprehensive, well-structured prompt that incorporates all the information gathered.
The prompt should be ready to use directly in {settings.get('target_ai', 'ChatGPT')}.
Output ONLY the prompt, no explanations."""

            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            response = client.messages.create(
                model=self.model,
                max_tokens=2000,
                system=system_prompt,
                messages=[{"role": "user", "content": "Generate the final optimized prompt now."}]
            )

            optimized_prompt = response.content[0].text
            print(f"[LUKTHAN] Generated final prompt from guided session ({len(optimized_prompt)} chars)")

            # Clear conversation history for next session
            self.conversation_history = []

            return {
                "optimized_prompt": optimized_prompt,
                "response": f"Based on our conversation, I've crafted an optimized prompt for **{settings.get('target_ai', 'ChatGPT')}**. This prompt incorporates all the details we discussed.",
                "response_type": "prompt_optimization",
                "quality_score": 92,
                "domain": domain,
                "suggestions": [
                    "Copy the prompt and use it directly",
                    "You can refine specific sections if needed",
                    "Start a new guided session for another prompt"
                ],
                "metadata": {
                    "mode": "guided",
                    "generated_from": "conversation",
                    "exchanges": len(self.conversation_history) // 2
                }
            }

        except Exception as e:
            print(f"[LUKTHAN] Final prompt generation error: {e}")
            return await self._optimize_prompt(
                "Generate a prompt based on our conversation",
                context, settings, thinking_steps
            )

    def _detect_intent(self, user_input: str, context: str) -> str:
        """
        Intelligently detect what the user wants:
        - prompt_optimization: User wants to create/improve a prompt for AI
        - conversation: User wants to chat casually
        - question: User is asking about life, philosophy, or general knowledge
        - hybrid: Mixed intent or unclear
        """
        text = user_input.lower().strip()

        # Greeting patterns (conversation)
        greetings = ["hello", "hi", "hey", "bonjour", "salut", "coucou", "yo", "sup",
                     "good morning", "good evening", "good afternoon", "what's up",
                     "how are you", "comment ça va", "ça va", "how's it going"]

        if any(text.startswith(g) or text == g for g in greetings):
            return "conversation"

        # Casual conversation patterns - EXPANDED
        casual_patterns = [
            r"^(thanks|thank you|merci)",
            r"^(okay|ok|alright|sure|yes|no|yep|nope)",
            r"^(nice|cool|great|awesome|amazing)",
            r"(how's your|what's your) (day|name)",
            r"^(lol|haha|😂|😊|👋)",
            r"(bye|goodbye|see you|later|à bientôt)",
            r"^just (saying|asking|wondering|curious)",
            r"^i'?m (doing|feeling|good|fine|great|okay|well)",
            r"(can you|do you) speak",
            r"(what|which) language",
            r"^(that's|thats) (cool|nice|great|interesting|funny)",
            r"^(really|wow|oh|hm+|ah)",
            r"(tell me (about yourself|a joke|something))",
            r"^(yeah|yea|yup|nah)",
            r"what do you (like|think|prefer)",
            r"^(hows|how is) (it|life|everything)",
        ]

        for pattern in casual_patterns:
            if re.search(pattern, text):
                return "conversation"

        # Life/philosophy questions
        life_patterns = [
            r"what is (the meaning of |)life",
            r"why (do|are) (we|humans)",
            r"what (do you think|is your opinion)",
            r"how (do i|should i|can i) (deal with|handle|cope|live)",
            r"what('s| is) (love|happiness|success|friendship)",
            r"(tell me|talk to me) about (yourself|you|life)",
            r"who are you",
            r"are you (real|alive|conscious|sentient)",
            r"what (can you|do you) (do|think|feel)",
            r"(advice|help me|guide me) (about|with|on) (life|career|relationship)",
            r"i (feel|am feeling|'m feeling) (sad|happy|confused|lost|anxious)",
            r"do you (believe|think)",
        ]

        for pattern in life_patterns:
            if re.search(pattern, text):
                return "question"

        # Prompt optimization indicators - must be STRONG signals
        prompt_keywords = [
            "prompt", "optimize", "generate prompt", "create prompt",
            "write a prompt", "better prompt", "ai prompt",
            "transform this", "enhance this", "refine prompt"
        ]

        # Technical/coding indicators (likely prompt optimization)
        tech_keywords = [
            "code", "function", "api", "database", "implement",
            "algorithm", "script", "program", "debug", "error",
            "python", "javascript", "react", "sql"
        ]

        prompt_score = sum(1 for kw in prompt_keywords if kw in text)
        tech_score = sum(1 for kw in tech_keywords if kw in text)

        # Only if STRONG prompt optimization signals
        if prompt_score >= 1:
            return "prompt_optimization"

        # If it's clearly technical with multiple signals
        if tech_score >= 2:
            return "prompt_optimization"

        # If attached file, likely wants optimization
        if context:
            return "prompt_optimization"

        # Short to medium messages without tech keywords = conversation
        if len(text.split()) < 15 and tech_score == 0:
            return "conversation"

        # Default to conversation for ambiguous cases (not hybrid)
        return "conversation"

    async def _generate_thinking(self, user_input: str, context: str, settings: Optional[Dict[str, Any]] = None) -> List[Dict[str, str]]:
        """Generate visible thinking/reasoning steps using AI."""
        thinking_steps = []
        settings = settings or {}

        # Detect intent first (needed for routing)
        intent = self._detect_intent(user_input, context)

        try:
            # Use Claude to generate real thinking/analysis
            system_prompt = """You are LUKTHAN's internal reasoning engine. Analyze the user's input and generate a concise thinking process.

Output exactly 4-5 short thinking steps in JSON array format. Each step should have:
- "step": A short title (2-3 words)
- "thought": Your actual analysis (1-2 sentences, be specific to THIS input)
- "icon": An appropriate emoji

Be genuinely analytical - don't use generic placeholder text. Actually analyze what the user wants.

Example format:
[
  {"step": "Understanding Request", "thought": "The user wants to build a REST API for user authentication with JWT tokens.", "icon": "🧠"},
  {"step": "Identifying Domain", "thought": "This is a backend development task involving security and web services.", "icon": "🎯"},
  {"step": "Complexity Assessment", "thought": "Medium complexity - requires knowledge of JWT, database integration, and security best practices.", "icon": "📊"},
  {"step": "Strategy Planning", "thought": "I'll create a prompt that covers token generation, validation, refresh logic, and secure storage.", "icon": "💡"},
  {"step": "Optimizing Output", "thought": "Structuring for ChatGPT with clear sections for implementation steps and code examples.", "icon": "✨"}
]

Return ONLY the JSON array, no other text."""

            user_message = f"User input: {user_input[:500]}"
            if context:
                user_message += f"\n\nAttached context: {context[:300]}..."
            if settings:
                user_message += f"\n\nSettings: Target AI={settings.get('target_ai', 'ChatGPT')}, Level={settings.get('expertise_level', 'Professional')}"

            print(f"[LUKTHAN] Generating AI thinking steps...")

            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            response = client.messages.create(
                model=self.model,
                max_tokens=800,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}]
            )

            # Parse the JSON response
            thinking_json = response.content[0].text.strip()
            # Handle potential markdown code blocks
            if thinking_json.startswith("```"):
                thinking_json = thinking_json.split("```")[1]
                if thinking_json.startswith("json"):
                    thinking_json = thinking_json[4:]
            thinking_json = thinking_json.strip()

            thinking_steps = json.loads(thinking_json)
            print(f"[LUKTHAN] Generated {len(thinking_steps)} AI thinking steps")
            return thinking_steps

        except Exception as e:
            print(f"[LUKTHAN] AI thinking generation failed: {e}, using fallback")

            # Fallback to rule-based thinking if AI fails
            thinking_steps.append({
                "step": "Understanding",
                "thought": f"Analyzing: '{user_input[:80]}{'...' if len(user_input) > 80 else ''}'",
                "icon": "🧠"
            })

            intent_description = {
                "prompt_optimization": "User wants to create or optimize an AI prompt",
                "conversation": "User wants to have a friendly conversation",
                "question": "User is asking a thoughtful question",
                "hybrid": "Multifaceted request requiring comprehensive response"
            }

            thinking_steps.append({
                "step": "Intent Analysis",
                "thought": intent_description.get(intent, "Processing the request..."),
                "icon": "🔍"
            })

            if intent == "prompt_optimization":
                domain = self._detect_domain(user_input, context)
                target_ai = settings.get("target_ai", "ChatGPT (GPT-4)")
                thinking_steps.append({
                    "step": "Domain Detection",
                    "thought": f"Identified domain: {domain.replace('_', ' ').title()}",
                    "icon": "🎯"
                })
                thinking_steps.append({
                    "step": "Optimization",
                    "thought": f"Tailoring prompt structure for {target_ai}",
                    "icon": "🤖"
                })

            thinking_steps.append({
                "step": "Generating",
                "thought": "Crafting the optimal response...",
                "icon": "✨"
            })

            return thinking_steps

    async def _have_conversation(self, user_input: str, thinking_steps: List[Dict]) -> Dict[str, Any]:
        """Handle casual conversation naturally using Claude API."""
        try:
            # Use Claude for natural conversation
            system_prompt = """You are LUKTHAN, a friendly and intelligent AI assistant. You enjoy natural conversations with humans.

GUIDELINES:
- For simple greetings (hi, hello, hey, good morning): Keep it brief and warm (1-2 sentences)
- For actual questions or conversation: Respond naturally and thoughtfully
- Be personable, warm, and engaging like a good friend
- DON'T list your capabilities unless specifically asked "what can you do?"
- DON'T say things like "I'm here to help with X, Y, Z..." in greetings
- Match the user's energy and tone

You can discuss any topic - life, philosophy, ideas, jokes, or just chat casually. Be genuine and conversational."""


            if not ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY is not set!")

            # Create client and make API call
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

            print(f"[LUKTHAN] Sending request to Claude {self.model}...")
            response = client.messages.create(
                model=self.model,
                max_tokens=500,  # Allow for natural conversation length
                system=system_prompt,
                messages=[{"role": "user", "content": user_input}]
            )

            message = response.content[0].text
            print(f"[LUKTHAN] === SUCCESS ===")
            print(f"[LUKTHAN] Response: {message[:200]}...")

            # Store in conversation history
            self.conversation_history.append({
                "role": "user",
                "content": user_input,
                "timestamp": datetime.now().isoformat()
            })
            self.conversation_history.append({
                "role": "assistant",
                "content": message,
                "timestamp": datetime.now().isoformat()
            })

            return {
                "response": message,
                "response_type": "conversation",
                "quality_score": 85,
                "domain": "conversation",
                "suggestions": [],  # No suggestions for casual conversation - keep it clean
                "metadata": {
                    "mood": "friendly",
                    "conversation_length": len(self.conversation_history)
                }
            }

        except Exception as e:
            # Detailed error logging
            print(f"[LUKTHAN] === ERROR ===")
            print(f"[LUKTHAN] Error type: {type(e).__name__}")
            print(f"[LUKTHAN] Error message: {str(e)}")
            import traceback
            traceback.print_exc()

            # Return error message to user (not silent fallback)
            error_message = f"I encountered an error connecting to my AI brain: {type(e).__name__}. Please check the API configuration."

            return {
                "response": error_message,
                "response_type": "error",
                "quality_score": 0,
                "domain": "error",
                "suggestions": ["Check API key configuration", "Restart the backend server"],
                "metadata": {"error": str(e), "error_type": type(e).__name__}
            }

    async def _answer_question(self, user_input: str, thinking_steps: List[Dict]) -> Dict[str, Any]:
        """Answer thoughtful questions about life, philosophy, etc."""
        try:
            system_prompt = """You are LUKTHAN, a wise and thoughtful AI assistant.
Answer with wisdom, empathy, and insight.
Be genuine and thoughtful - draw from philosophy, psychology, and human experience.
Don't be preachy, just be real and helpful.
Provide a thoughtful, genuine response that could actually help or enlighten someone.
Keep it conversational but meaningful. Around 2-4 paragraphs."""

            print(f"[LUKTHAN] Calling Claude API for question: {user_input[:50]}...")

            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            response = client.messages.create(
                model=self.model,
                max_tokens=2048,
                system=system_prompt,
                messages=[{"role": "user", "content": user_input}]
            )
            message = response.content[0].text
            print(f"[LUKTHAN] SUCCESS! Claude response: {message[:100]}...")

            return {
                "response": message,
                "response_type": "wisdom",
                "quality_score": 90,
                "domain": "life_wisdom",
                "suggestions": [
                    "Feel free to explore this topic further",
                    "I'm happy to discuss more deeply",
                    "What aspects resonate with you?"
                ],
                "metadata": {
                    "topic": "life_wisdom",
                    "depth": "thoughtful"
                }
            }

        except Exception as e:
            return {
                "response": "That's a profound question. While I'd love to share my thoughts, let me reflect on it. What draws you to ask this?",
                "response_type": "wisdom",
                "quality_score": 75,
                "domain": "life_wisdom",
                "suggestions": ["Tell me more about what's on your mind"],
                "metadata": {"error": str(e)}
            }

    async def _smart_response(
        self,
        user_input: str,
        context: str,
        settings: Dict[str, Any],
        thinking_steps: List[Dict]
    ) -> Dict[str, Any]:
        """Smart hybrid response - figure out the best way to help."""
        try:
            system_prompt = """You are LUKTHAN, an intelligent AI assistant that helps users in the most appropriate way.
Analyze what the user needs and respond appropriately:
- If they need help with a task, guide them
- If they're asking for information, provide it
- If they want to create an AI prompt, help them formulate it
- If they just want to chat, be conversational
Respond naturally and helpfully. Be concise but thorough."""

            user_message = user_input
            if context:
                user_message += f"\n\nAdditional context: {context[:500]}"

            print(f"[LUKTHAN] Calling Claude API for smart response: {user_input[:50]}...")

            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            response = client.messages.create(
                model=self.model,
                max_tokens=2048,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}]
            )
            message = response.content[0].text
            print(f"[LUKTHAN] SUCCESS! Claude response: {message[:100]}...")

            # Check if response looks like it should be a prompt
            if any(kw in user_input.lower() for kw in ["create", "write", "make", "build", "help me"]):
                # Also generate an optimized prompt
                result = await self._optimize_prompt(user_input, context, settings, thinking_steps)
                result["response"] = message
                result["response_type"] = "hybrid"
                return result

            return {
                "response": message,
                "response_type": "smart",
                "quality_score": 85,
                "domain": "general",
                "suggestions": [
                    "I can help optimize this into an AI prompt",
                    "Feel free to ask follow-up questions",
                    "Would you like me to elaborate?"
                ],
                "metadata": {
                    "approach": "intelligent_hybrid"
                }
            }

        except Exception as e:
            # Fall back to prompt optimization
            return await self._optimize_prompt(user_input, context, settings, thinking_steps)

    async def _optimize_prompt(
        self,
        user_input: str,
        context: str,
        settings: Dict[str, Any],
        thinking_steps: List[Dict]
    ) -> Dict[str, Any]:
        """Optimize a user's input into a powerful AI prompt using Claude AI."""
        # Analyze the input for metadata
        analysis = await self._analyze_input(user_input, context, settings)

        # Get settings
        target_ai = settings.get("target_ai", "ChatGPT (GPT-4)")
        expertise = settings.get("expertise_level", "Professional")
        output_language = settings.get("language", "English")

        try:
            # Use Claude to actually optimize the prompt
            system_prompt = f"""You are LUKTHAN, an expert AI prompt engineer. Your task is to transform user ideas into highly optimized, powerful prompts.

TARGET AI MODEL: {target_ai}
EXPERTISE LEVEL: {expertise}
OUTPUT LANGUAGE: {output_language}

Your job is to:
1. Understand what the user wants to achieve
2. Create a comprehensive, well-structured prompt optimized for {target_ai}
3. Include clear instructions, context, constraints, and expected output format
4. Tailor vocabulary and complexity for {expertise} level
5. Apply prompt engineering best practices (chain-of-thought, few-shot examples if helpful, clear delimiters)

IMPORTANT: Output ONLY the optimized prompt itself. Do not include explanations, meta-commentary, or notes about the prompt. The output should be ready to copy-paste directly into {target_ai}.

For {target_ai}, consider these best practices:
- ChatGPT: Use markdown formatting, system/user role separation, be explicit
- Claude: Leverage long context, use XML tags for structure, be nuanced
- Gemini: Use clear sections, conversational but professional
- Llama/Mistral: Use instruction format with [INST] tags
- Copilot: Code-focused with clear comments"""

            user_message = f"Transform this into an optimized AI prompt:\n\n{user_input}"
            if context:
                user_message += f"\n\nAdditional context/file content:\n{context[:2000]}"

            print(f"[LUKTHAN] Calling Claude API to optimize prompt...")
            print(f"[LUKTHAN] Target AI: {target_ai}, Expertise: {expertise}")

            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            response = client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}]
            )

            optimized_prompt = response.content[0].text
            print(f"[LUKTHAN] SUCCESS! Generated optimized prompt ({len(optimized_prompt)} chars)")

            # Score based on actual content quality
            quality_score = self._score_prompt(optimized_prompt, analysis)

            # Get AI-generated suggestions
            suggestions = await self._generate_suggestions(user_input, optimized_prompt, analysis)

            return {
                "optimized_prompt": optimized_prompt,
                "response": f"I've analyzed your request and created an optimized prompt specifically designed for **{target_ai}** at **{expertise}** level. The prompt incorporates best practices for prompt engineering including clear structure, appropriate context, and explicit output expectations.",
                "response_type": "prompt_optimization",
                "quality_score": quality_score,
                "domain": analysis["domain"],
                "task_type": analysis["task_type"],
                "suggestions": suggestions,
                "metadata": {
                    "complexity": analysis["complexity"],
                    "confidence": analysis["confidence"],
                    "key_topics": analysis["key_topics"],
                    "detected_language": analysis.get("detected_language", "general"),
                    "target_ai": target_ai,
                    "expertise_level": expertise,
                    "ai_optimized": True
                }
            }

        except Exception as e:
            print(f"[LUKTHAN] ERROR in prompt optimization: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()

            # Fallback to template-based generation if API fails
            optimized_prompt = self._generate_prompt(
                domain=analysis["domain"],
                task_type=analysis["task_type"],
                user_request=user_input,
                context=context,
                language=analysis.get("detected_language", "Python"),
                settings=settings
            )

            quality_score = self._score_prompt(optimized_prompt, analysis)
            suggestions = self._get_suggestions(analysis, quality_score)

            return {
                "optimized_prompt": optimized_prompt,
                "response": f"I've created a prompt for **{target_ai}** using templates (AI optimization unavailable: {type(e).__name__}). Please check the API configuration.",
                "response_type": "prompt_optimization",
                "quality_score": quality_score,
                "domain": analysis["domain"],
                "task_type": analysis["task_type"],
                "suggestions": suggestions,
                "metadata": {
                    "complexity": analysis["complexity"],
                    "confidence": analysis["confidence"],
                    "key_topics": analysis["key_topics"],
                    "detected_language": analysis.get("detected_language", "general"),
                    "target_ai": target_ai,
                    "expertise_level": expertise,
                    "ai_optimized": False,
                    "error": str(e)
                }
            }

    async def _generate_suggestions(self, original_input: str, optimized_prompt: str, analysis: Dict[str, Any]) -> List[str]:
        """Generate AI-powered suggestions for further improvement."""
        try:
            client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            response = client.messages.create(
                model=self.model,
                max_tokens=500,
                system="You are a prompt engineering expert. Generate 3 brief, actionable suggestions for how the user could further improve their prompt or get better results. Each suggestion should be one concise sentence. Return only the 3 suggestions, one per line, no numbering or bullets.",
                messages=[{"role": "user", "content": f"Original request: {original_input}\n\nOptimized prompt: {optimized_prompt[:1000]}"}]
            )

            suggestions = [s.strip() for s in response.content[0].text.strip().split('\n') if s.strip()]
            return suggestions[:3]

        except Exception as e:
            print(f"[LUKTHAN] Suggestions generation failed: {e}")
            return self._get_suggestions(analysis, 80)

    async def _analyze_input(
        self,
        user_input: str,
        context: str,
        settings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze user input to determine domain, task type, and metadata."""
        specified_domain = settings.get("domain", "auto")

        if specified_domain != "auto" and specified_domain in domain_tasks:
            domain = specified_domain
        else:
            domain = self._detect_domain(user_input, context)

        task_type = self._detect_task_type(user_input, domain)

        detected_language = "general"
        if domain == "coding":
            detected_language = self._detect_programming_language(user_input + " " + context)

        complexity = self._assess_complexity(user_input, context)
        key_topics = self._extract_key_topics(user_input)
        confidence = self._calculate_confidence(user_input, domain, task_type)

        return {
            "domain": domain,
            "task_type": task_type,
            "complexity": complexity,
            "key_topics": key_topics,
            "confidence": confidence,
            "detected_language": detected_language
        }

    def _detect_domain(self, user_input: str, context: str) -> str:
        """Detect the domain based on keywords and patterns."""
        text = (user_input + " " + context).lower()

        domain_scores = {
            "coding": 0,
            "research": 0,
            "data_science": 0,
            "general": 0
        }

        coding_keywords = ["code", "function", "class", "api", "bug", "error", "debug",
                         "implement", "program", "script", "variable", "loop", "array",
                         "database", "server", "frontend", "backend", "deploy", "react",
                         "python", "javascript", "typescript", "java", "css", "html"]
        for kw in coding_keywords:
            if kw in text:
                domain_scores["coding"] += 1

        if re.search(r'```|def |class |function |const |let |var |import |from ', text):
            domain_scores["coding"] += 3

        research_keywords = ["research", "study", "paper", "thesis", "literature",
                           "methodology", "hypothesis", "analysis", "academic",
                           "citation", "journal", "publication"]
        for kw in research_keywords:
            if kw in text:
                domain_scores["research"] += 1

        # Basic data science keywords (1 point each)
        ds_keywords = ["data", "machine learning", "ml", "model", "predict",
                      "dataset", "visualization", "statistics", "neural",
                      "training", "algorithm", "feature", "regression", "classification",
                      "csv", "dataframe", "pandas", "numpy", "sklearn", "scikit",
                      "clean", "cleaning", "preprocessing", "preprocess",
                      "missing", "null", "nan", "impute", "imputation",
                      "leakage", "leak", "overfit", "overfitting", "underfit",
                      "train", "test", "validation", "split", "cross-validation",
                      "forecast", "forecasting", "time series", "arima",
                      "eda", "exploratory", "correlation", "distribution"]
        for kw in ds_keywords:
            if kw in text:
                domain_scores["data_science"] += 1

        # High-value ML terms (3 points each - very specific indicators)
        ml_specific = ["lstm", "xgboost", "random forest", "gradient boosting",
                      "lightgbm", "catboost", "tensorflow", "pytorch", "keras",
                      "transformer", "bert", "gpt", "cnn", "rnn", "autoencoder",
                      "hyperparameter", "epoch", "batch size", "learning rate",
                      "confusion matrix", "roc", "auc", "precision", "recall", "f1"]
        for kw in ml_specific:
            if kw in text:
                domain_scores["data_science"] += 3

        max_score = max(domain_scores.values())
        if max_score == 0:
            return "general"

        for domain, score in domain_scores.items():
            if score == max_score:
                return domain

        return "general"

    def _detect_task_type(self, user_input: str, domain: str) -> str:
        """Detect specific task type based on keywords."""
        text = user_input.lower()

        possible_tasks = domain_tasks.get(domain, ["general_query"])

        task_scores = {}
        for task in possible_tasks:
            task_scores[task] = 0
            keywords = task_keywords.get(task, [])
            for kw in keywords:
                if kw in text:
                    task_scores[task] += 1

        max_score = max(task_scores.values()) if task_scores else 0
        if max_score == 0:
            return possible_tasks[0] if possible_tasks else "general_query"

        for task, score in task_scores.items():
            if score == max_score:
                return task

        return "general_query"

    def _detect_programming_language(self, text: str) -> str:
        """Detect the programming language from text."""
        text = text.lower()

        for lang, keywords in language_keywords.items():
            for kw in keywords:
                if kw in text:
                    return lang

        return "python"

    def _assess_complexity(self, user_input: str, context: str) -> str:
        """Assess the complexity of the request."""
        text = user_input + " " + context
        word_count = len(text.split())

        complex_indicators = ["complex", "advanced", "sophisticated", "enterprise",
                            "scalable", "distributed", "microservice", "architecture",
                            "optimize", "performance", "security"]

        complexity_score = sum(1 for ind in complex_indicators if ind in text.lower())

        if word_count > 200 or complexity_score >= 3:
            return "high"
        elif word_count > 50 or complexity_score >= 1:
            return "medium"
        else:
            return "low"

    def _extract_key_topics(self, user_input: str) -> List[str]:
        """Extract key topics from the input."""
        text = user_input.lower()

        stop_words = {"the", "a", "an", "is", "are", "was", "were", "be", "been",
                     "being", "have", "has", "had", "do", "does", "did", "will",
                     "would", "could", "should", "may", "might", "must", "shall",
                     "can", "need", "dare", "ought", "used", "to", "of", "in",
                     "for", "on", "with", "at", "by", "from", "as", "into", "like",
                     "through", "after", "over", "between", "out", "against",
                     "during", "without", "before", "under", "around", "among",
                     "i", "me", "my", "myself", "we", "our", "ours", "you", "your",
                     "he", "him", "his", "she", "her", "it", "its", "they", "them",
                     "what", "which", "who", "whom", "this", "that", "these", "those",
                     "am", "and", "but", "if", "or", "because", "until", "while",
                     "how", "help", "want", "please", "create", "make", "write"}

        words = re.findall(r'\b[a-z]+\b', text)
        meaningful_words = [w for w in words if w not in stop_words and len(w) > 2]

        word_freq = {}
        for word in meaningful_words:
            word_freq[word] = word_freq.get(word, 0) + 1

        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, _ in sorted_words[:4]]

    def _calculate_confidence(self, user_input: str, domain: str, task_type: str) -> float:
        """Calculate confidence score for the analysis."""
        base_confidence = 0.7

        word_count = len(user_input.split())
        if word_count > 50:
            base_confidence += 0.15
        elif word_count > 20:
            base_confidence += 0.1

        text = user_input.lower()
        task_kws = task_keywords.get(task_type, [])
        matches = sum(1 for kw in task_kws if kw in text)
        if matches >= 3:
            base_confidence += 0.1
        elif matches >= 1:
            base_confidence += 0.05

        return min(base_confidence, 0.98)

    def _generate_prompt(
        self,
        domain: str,
        task_type: str,
        user_request: str,
        context: str,
        language: str = "Python",
        settings: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate an optimized prompt using templates with AI-specific formatting."""
        settings = settings or {}

        target_ai = settings.get("target_ai", "ChatGPT (GPT-4)")
        expertise = settings.get("expertise_level", "Professional")
        output_language = settings.get("language", "English")

        # Get base template
        template = templates.get(task_type, templates["general_query"])

        try:
            base_content = template.format(
                language=language.capitalize(),
                user_request=user_request,
                context=context if context else "No additional context provided."
            )
        except KeyError:
            base_content = template.replace("{user_request}", user_request)
            base_content = base_content.replace("{context}", context if context else "No additional context provided.")
            base_content = base_content.replace("{language}", language.capitalize())

        # Apply AI-specific formatting
        optimized = self._format_for_target_ai(base_content, target_ai, domain)

        # Apply expertise level adjustments
        optimized = self._adjust_for_expertise(optimized, expertise, domain)

        # Add output language instruction
        if output_language != "English":
            optimized += f"\n\n**Important:** Respond entirely in {output_language}."

        return optimized

    def _format_for_target_ai(self, content: str, target_ai: str, domain: str) -> str:
        """Format the prompt specifically for the target AI model."""

        # AI-specific prompt structures
        ai_formats = {
            "ChatGPT (GPT-4)": {
                "prefix": "You are an expert assistant. ",
                "style": "structured",
                "features": ["Uses markdown formatting", "Appreciates step-by-step requests", "Works well with examples"],
                "wrapper": lambda c: f"{c}\n\nPlease structure your response with clear headings and bullet points where appropriate."
            },
            "ChatGPT (GPT-3.5)": {
                "prefix": "You are a helpful assistant. ",
                "style": "concise",
                "features": ["Prefers shorter prompts", "Direct instructions work best", "Less context needed"],
                "wrapper": lambda c: f"{c}\n\nKeep your response focused and concise."
            },
            "Claude": {
                "prefix": "",
                "style": "detailed",
                "features": ["Excels with nuanced instructions", "Handles long contexts well", "Thoughtful analysis"],
                "wrapper": lambda c: f"I'd like your help with the following task.\n\n{c}\n\nPlease think through this carefully and provide a thorough response."
            },
            "Claude (Opus)": {
                "prefix": "",
                "style": "analytical",
                "features": ["Best for complex reasoning", "Handles ambiguity well", "Deep analysis"],
                "wrapper": lambda c: f"I have a complex task that requires careful analysis.\n\n{c}\n\nPlease approach this systematically, considering multiple perspectives and edge cases."
            },
            "Gemini": {
                "prefix": "",
                "style": "conversational",
                "features": ["Good with multimodal tasks", "Natural conversation flow", "Web-aware"],
                "wrapper": lambda c: f"{c}\n\nProvide a comprehensive and well-organized response."
            },
            "Gemini Pro": {
                "prefix": "",
                "style": "professional",
                "features": ["Advanced reasoning", "Code generation", "Detailed explanations"],
                "wrapper": lambda c: f"Task:\n{c}\n\nPlease provide a detailed, professional-quality response with explanations where helpful."
            },
            "Llama": {
                "prefix": "[INST] ",
                "suffix": " [/INST]",
                "style": "instruction",
                "features": ["Instruction-tuned format", "Clear delimiters help", "Concise prompts preferred"],
                "wrapper": lambda c: f"[INST] {c} [/INST]"
            },
            "Mistral": {
                "prefix": "<s>[INST] ",
                "suffix": " [/INST]",
                "style": "instruction",
                "features": ["Instruction format", "Efficient with shorter prompts", "Good at coding"],
                "wrapper": lambda c: f"<s>[INST] {c} [/INST]"
            },
            "Copilot": {
                "prefix": "",
                "style": "code-focused",
                "features": ["Code-optimized", "Comment-driven generation", "Context from files"],
                "wrapper": lambda c: f"// Task: {c}\n// Please provide working code with comments explaining the implementation."
            }
        }

        # Get format for target AI (default to ChatGPT style)
        ai_config = ai_formats.get(target_ai, ai_formats["ChatGPT (GPT-4)"])

        # Apply the wrapper function
        formatted = ai_config["wrapper"](content)

        return formatted

    def _adjust_for_expertise(self, content: str, expertise: str, domain: str) -> str:
        """Adjust the prompt's complexity and vocabulary based on expertise level."""

        expertise_configs = {
            "Beginner": {
                "instruction": "Explain in simple terms that a beginner can understand.",
                "vocabulary": "simple",
                "detail_level": "step-by-step with explanations",
                "assumptions": "Assume no prior knowledge.",
                "examples": "Include simple examples and analogies.",
                "prefix": "I'm new to this topic. "
            },
            "Intermediate": {
                "instruction": "Provide a balanced explanation suitable for someone with basic knowledge.",
                "vocabulary": "standard technical terms with brief explanations",
                "detail_level": "moderate detail",
                "assumptions": "Assume familiarity with basic concepts.",
                "examples": "Include practical examples.",
                "prefix": ""
            },
            "Professional": {
                "instruction": "Provide a professional-level response.",
                "vocabulary": "industry-standard terminology",
                "detail_level": "comprehensive with best practices",
                "assumptions": "Assume professional working knowledge.",
                "examples": "Include production-ready examples where applicable.",
                "prefix": ""
            },
            "Expert": {
                "instruction": "Provide an expert-level response with advanced insights.",
                "vocabulary": "advanced technical terminology",
                "detail_level": "in-depth with edge cases and optimizations",
                "assumptions": "Assume deep expertise in the field.",
                "examples": "Focus on advanced patterns, optimizations, and trade-offs.",
                "prefix": "As an expert in this field, I need "
            }
        }

        config = expertise_configs.get(expertise, expertise_configs["Professional"])

        # Build expertise-specific additions
        expertise_section = f"\n\n**Response Requirements:**"
        expertise_section += f"\n- {config['instruction']}"
        expertise_section += f"\n- Use {config['vocabulary']}"
        expertise_section += f"\n- {config['assumptions']}"

        if expertise == "Beginner":
            expertise_section += f"\n- {config['examples']}"
            expertise_section += "\n- Avoid jargon or explain it when necessary"
            expertise_section += "\n- Break down complex concepts into digestible parts"

        elif expertise == "Expert":
            expertise_section += f"\n- {config['examples']}"
            expertise_section += "\n- Discuss performance implications and trade-offs"
            expertise_section += "\n- Include considerations for scale and edge cases"

        # Add prefix if needed (skip if AI already adds its own opener)
        if config["prefix"] and not content.startswith("I'd like") and not content.startswith("I have"):
            content = config["prefix"] + content

        return content + expertise_section

    def _score_prompt(self, prompt: str, analysis: Dict[str, Any]) -> int:
        """Score the quality of the generated prompt (0-100)."""
        score = 50

        word_count = len(prompt.split())
        if 100 <= word_count <= 500:
            score += 15
        elif 50 <= word_count < 100:
            score += 10
        elif word_count > 500:
            score += 5

        if "**Task:**" in prompt:
            score += 10
        if "**Requirements:**" in prompt or "**Guidelines:**" in prompt:
            score += 8
        if "**Output" in prompt:
            score += 7
        if "**Context:**" in prompt:
            score += 5

        if analysis["complexity"] == "high":
            score += 5
        elif analysis["complexity"] == "medium":
            score += 3

        score += int(analysis["confidence"] * 10)

        return min(score, 100)

    def _get_suggestions(self, analysis: Dict[str, Any], quality_score: int) -> List[str]:
        """Generate improvement suggestions."""
        suggestions = []

        if quality_score < 70:
            suggestions.append("Consider adding more specific details to your request")

        if analysis["complexity"] == "low":
            suggestions.append("Try including more context about your requirements")

        if len(analysis["key_topics"]) < 2:
            suggestions.append("Mention specific technologies or tools you want to use")

        if analysis["domain"] == "coding":
            suggestions.append("Specify expected input/output formats for better results")

        if analysis["domain"] == "research":
            suggestions.append("Include the scope and timeframe for your research")

        if analysis["domain"] == "data_science":
            suggestions.append("Describe your dataset characteristics if applicable")

        if not suggestions:
            suggestions.append("Your prompt is well-structured! Consider adding examples for even better results")

        return suggestions[:3]


# Create singleton instance
intelligent_agent = IntelligentAgent()


async def process_message(
    user_input: str,
    file_content: Optional[str] = None,
    file_type: Optional[str] = None,
    settings: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Main wrapper function - processes any message intelligently."""
    return await intelligent_agent.process_message(user_input, file_content, file_type, settings)


# Keep backward compatibility
async def optimize_prompt(
    user_input: str,
    file_content: Optional[str] = None,
    file_type: Optional[str] = None,
    settings: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Backward compatible wrapper."""
    result = await intelligent_agent.process_message(user_input, file_content, file_type, settings)
    return result


def reset_conversation() -> Dict[str, Any]:
    """Reset the conversation history for guided mode."""
    intelligent_agent.conversation_history = []
    print("[LUKTHAN] Conversation history reset")
    return {"success": True, "message": "Conversation history cleared"}
