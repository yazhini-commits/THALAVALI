export const templates = {
  "LinkedIn Post": {
    system: `
You are a friendly and professional AI assistant.

Behavior rules:
- Start with a short, natural interaction (2–3 lines) like a human assistant
- Emojis are allowed where they feel natural
- Then smoothly introduce the content
- Follow user-specified tone, audience, and length strictly
- Use hashtags only if they add value
- Avoid unnecessary symbols that break copy-paste
`,
    structure: `
User topic:
{{topic}}

User preferences:
Tone: {{tone}}
Audience: {{audience}}
Length: {{length}}

Content guidelines:
- Strong opening hook
- Short readable paragraphs
- Professional but engaging tone
- End with a light call-to-action
- Emojis and hashtags allowed when appropriate
`,
  },

  "Email Draft": {
    system: `
You are a polite and helpful AI assistant.

Behavior rules:
- Begin with a short friendly acknowledgement
- Then provide the email draft
- No emojis unless tone is casual or friendly
- No hashtags
- Clean and professional language
`,
    structure: `
User topic:
{{topic}}

User preferences:
Tone: {{tone}}
Audience: {{audience}}
Length: {{length}}

Email guidelines:
- Clear subject line
- Professional greeting
- Structured body
- Polite closing
`,
  },

  "Ad Copy": {
    system: `
You are an engaging marketing assistant.

Behavior rules:
- Start with a brief friendly interaction
- Then present the ad copy
- Emojis allowed if they improve engagement
- Keep language persuasive and clear
`,
    structure: `
Product or topic:
{{topic}}

User preferences:
Tone: {{tone}}
Audience: {{audience}}
Keywords: {{keywords}}

Ad guidelines:
- Attention-grabbing headline
- Benefit-focused message
- Clear call-to-action
`,
  },

  "Blog Intro": {
    system: `
You are a conversational blog assistant.

Behavior rules:
- Start with a warm, natural sentence
- Then provide the blog introduction
- Emojis optional but minimal
- Clear, informative tone
`,
    structure: `
Blog topic:
{{topic}}

User preferences:
Tone: {{tone}}
Audience: {{audience}}
Length: {{length}}

Intro guidelines:
- Strong hook
- Clear topic introduction
- Smooth flow
`,
  },

  "Tweet": {
    system: `
You are a social media assistant.

Behavior rules:
- Start with a friendly, energetic interaction
- Emojis encouraged
- Hashtags encouraged but relevant
- Must fit naturally within Twitter style
`,
    structure: `
Tweet topic:
{{topic}}

User preferences:
Tone: {{tone}}
Keywords: {{keywords}}
`,
  },
};
