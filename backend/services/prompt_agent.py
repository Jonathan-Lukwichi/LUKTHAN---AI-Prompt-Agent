from typing import Dict, Any, Optional, List
import google.generativeai as genai
import os
import re
import json
import asyncio
from datetime import datetime
from .prompt_templates import templates, domain_tasks, task_keywords, language_keywords

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))


class IntelligentAgent:
    """
    An intelligent AI agent that can:
    1. Detect user intent (prompt optimization vs general conversation)
    2. Think through problems step by step
    3. Have natural conversations about life, philosophy, and general topics
    4. Optimize prompts when requested
    """

    def __init__(self):
        # Use Gemini 2.0 Flash - fast, efficient, and widely available
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.conversation_history: List[Dict[str, str]] = []

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
        """
        settings = settings or {}
        context = file_content or ""

        # Step 1: Generate thinking process
        thinking_steps = await self._generate_thinking(user_input, context, settings)

        # Step 2: Detect user intent
        intent = self._detect_intent(user_input, context)

        # Step 3: Process based on intent
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

        # Casual conversation patterns
        casual_patterns = [
            r"^(thanks|thank you|merci)",
            r"^(okay|ok|alright|sure|yes|no|yep|nope)",
            r"^(nice|cool|great|awesome|amazing)",
            r"(how's your|what's your) (day|name)",
            r"^(lol|haha|😂|😊|👋)",
            r"(bye|goodbye|see you|later|à bientôt)",
            r"^just (saying|asking|wondering|curious)",
        ]

        for pattern in casual_patterns:
            if re.search(pattern, text):
                return "conversation"

        # Prompt optimization indicators
        prompt_keywords = [
            "prompt", "optimize", "improve", "generate", "create prompt",
            "write a prompt", "help me ask", "better prompt", "ai prompt",
            "chatgpt", "claude", "gpt", "ask ai", "ai to", "transform",
            "enhance", "refine prompt", "make it better"
        ]

        # Technical/coding indicators (likely prompt optimization)
        tech_keywords = [
            "code", "function", "api", "database", "implement", "build",
            "develop", "create a", "write a", "make a", "generate a",
            "help me with", "i need", "i want to", "can you help"
        ]

        prompt_score = sum(1 for kw in prompt_keywords if kw in text)
        tech_score = sum(1 for kw in tech_keywords if kw in text)

        # If strong prompt optimization signals
        if prompt_score >= 2 or (prompt_score >= 1 and tech_score >= 2):
            return "prompt_optimization"

        # If it's a task/request with technical content
        if tech_score >= 2 and len(text.split()) > 10:
            return "prompt_optimization"

        # If attached file, likely wants optimization
        if context:
            return "prompt_optimization"

        # Short messages are usually conversation
        if len(text.split()) < 5:
            return "conversation"

        # Default: try to be smart about it
        return "hybrid"

    async def _generate_thinking(self, user_input: str, context: str, settings: Optional[Dict[str, Any]] = None) -> List[Dict[str, str]]:
        """Generate visible thinking/reasoning steps."""
        thinking_steps = []

        # Step 1: Understanding
        thinking_steps.append({
            "step": "Understanding",
            "thought": f"Let me understand what the user is asking: '{user_input[:100]}{'...' if len(user_input) > 100 else ''}'",
            "icon": "🧠"
        })

        # Step 2: Analysis
        intent = self._detect_intent(user_input, context)
        intent_description = {
            "prompt_optimization": "The user wants help creating or improving an AI prompt",
            "conversation": "The user wants to have a friendly conversation",
            "question": "The user is asking a thoughtful question about life or general topics",
            "hybrid": "The user's request is multifaceted - I'll provide a comprehensive response"
        }

        thinking_steps.append({
            "step": "Analyzing Intent",
            "thought": intent_description.get(intent, "Processing the request..."),
            "icon": "🔍"
        })

        # Step 3: Planning response
        settings = settings or {}
        if intent == "prompt_optimization":
            # Detect domain
            domain = self._detect_domain(user_input, context)
            thinking_steps.append({
                "step": "Detecting Domain",
                "thought": f"This appears to be related to: {domain.replace('_', ' ').title()}",
                "icon": "🎯"
            })

            # Assess complexity
            complexity = self._assess_complexity(user_input, context)
            thinking_steps.append({
                "step": "Assessing Complexity",
                "thought": f"Complexity level: {complexity.title()} - adjusting response accordingly",
                "icon": "📊"
            })

            # Show target AI optimization
            target_ai = settings.get("target_ai", "ChatGPT (GPT-4)")
            thinking_steps.append({
                "step": "Optimizing for AI",
                "thought": f"Tailoring prompt structure for {target_ai}",
                "icon": "🤖"
            })

            # Show expertise level
            expertise = settings.get("expertise_level", "Professional")
            thinking_steps.append({
                "step": "Adjusting Level",
                "thought": f"Setting vocabulary and detail for {expertise} level",
                "icon": "📚"
            })

        elif intent == "conversation":
            thinking_steps.append({
                "step": "Preparing Response",
                "thought": "Preparing a friendly, natural response...",
                "icon": "💬"
            })

        elif intent == "question":
            thinking_steps.append({
                "step": "Reflecting",
                "thought": "This is a meaningful question - let me think deeply about it...",
                "icon": "💭"
            })

        # Step 4: Formulating
        thinking_steps.append({
            "step": "Formulating",
            "thought": "Crafting the best possible response...",
            "icon": "✨"
        })

        return thinking_steps

    async def _have_conversation(self, user_input: str, thinking_steps: List[Dict]) -> Dict[str, Any]:
        """Handle casual conversation naturally."""
        try:
            # Use Gemini for natural conversation
            conversation_prompt = f"""You are LUKTHAN, a friendly and intelligent AI assistant.
You have a warm personality and enjoy conversing with humans.
You're knowledgeable but humble, and you communicate naturally like a thoughtful friend.

User message: {user_input}

Respond naturally and warmly. Keep your response concise but meaningful.
If they greet you, greet them back warmly.
If they ask about you, share a bit about yourself as LUKTHAN.
Be genuine, helpful, and personable."""

            response = self.model.generate_content(conversation_prompt)
            message = response.text

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
                "suggestions": [
                    "Feel free to ask me anything!",
                    "I can also help optimize your AI prompts",
                    "Tell me what's on your mind"
                ],
                "metadata": {
                    "mood": "friendly",
                    "conversation_length": len(self.conversation_history)
                }
            }

        except Exception as e:
            # Fallback response
            return {
                "response": "Hello! I'm LUKTHAN, your AI companion. How can I help you today? I can chat with you about anything or help you create powerful AI prompts!",
                "response_type": "conversation",
                "quality_score": 80,
                "domain": "conversation",
                "suggestions": ["Ask me anything!", "I'm here to help"],
                "metadata": {"error": str(e)}
            }

    async def _answer_question(self, user_input: str, thinking_steps: List[Dict]) -> Dict[str, Any]:
        """Answer thoughtful questions about life, philosophy, etc."""
        try:
            question_prompt = f"""You are LUKTHAN, a wise and thoughtful AI assistant.
Someone has asked you a meaningful question. Answer with wisdom, empathy, and insight.
Be genuine and thoughtful - draw from philosophy, psychology, and human experience.
Don't be preachy, just be real and helpful.

Question: {user_input}

Provide a thoughtful, genuine response that could actually help or enlighten someone.
Keep it conversational but meaningful. Around 2-4 paragraphs."""

            response = self.model.generate_content(question_prompt)
            message = response.text

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
            smart_prompt = f"""You are LUKTHAN, an intelligent AI assistant that helps users in the most appropriate way.

User's message: {user_input}
{f"Additional context: {context[:500]}" if context else ""}

Analyze what the user needs and respond appropriately:
- If they need help with a task, guide them
- If they're asking for information, provide it
- If they want to create an AI prompt, help them formulate it
- If they just want to chat, be conversational

Respond naturally and helpfully. Be concise but thorough."""

            response = self.model.generate_content(smart_prompt)
            message = response.text

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
        """Optimize a user's input into a powerful AI prompt."""
        # Analyze the input
        analysis = await self._analyze_input(user_input, context, settings)

        # Generate optimized prompt
        optimized_prompt = self._generate_prompt(
            domain=analysis["domain"],
            task_type=analysis["task_type"],
            user_request=user_input,
            context=context,
            language=analysis.get("detected_language", "Python"),
            settings=settings
        )

        # Score the prompt
        quality_score = self._score_prompt(optimized_prompt, analysis)

        # Get suggestions
        suggestions = self._get_suggestions(analysis, quality_score)

        # Get settings for response message
        target_ai = settings.get("target_ai", "ChatGPT (GPT-4)")
        expertise = settings.get("expertise_level", "Professional")

        return {
            "optimized_prompt": optimized_prompt,
            "response": f"I've created an optimized prompt specifically formatted for **{target_ai}** at **{expertise}** level. The prompt structure and vocabulary have been tailored for best results.",
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
                "expertise_level": expertise
            }
        }

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
