/* ------------- LOCAL TEMPLATE STORAGE ------------- */

const STORAGE_KEY = "user_templates";

/* get templates */
export function getTemplates(type) {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  if (!stored[type]) return [];

  return stored[type].map((tpl, i) => {
    if (typeof tpl === "string") {
      return {
        id: "custom_" + i + "_" + Date.now(),
        title: extractTitle(tpl),
        structure: tpl,
        isDefault: false,
      };
    }
    return tpl;
  });
}



/* save template */
export function saveTemplate(type, templateText) {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  if (!stored[type]) stored[type] = [];

  const templateObject = {
    id: Date.now(),
    title: extractTitle(templateText),
    structure: templateText
  };

  stored[type].unshift(templateObject);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function extractTitle(text) {
  const firstLine = text.split("\n")[0].trim();

  if (firstLine.length > 60)
    return firstLine.slice(0, 60) + "...";

  return firstLine || "Custom Template";
}

/* convert string → template object */
export function normalizeTemplates(list) {
  return (list || []).map((tpl, index) => {
    // already object
    if (typeof tpl === "object") return tpl;

    return {
      id: "default_" + index + "_" + Math.random(),
      title: extractTitle(tpl),
      structure: tpl,
      isDefault: true,
    };
  });
}


/* =========================================================
   DEFAULT PROFESSIONAL GLOBAL TEMPLATES
   ========================================================= */

export const defaultTemplates = {

  /* ================= LINKEDIN ================= */
  "LinkedIn Post": [

`🚀 {{topic}}

I’m excited to share an update with my network.

After weeks of effort, I’ve finally achieved {{achievement}}.

This journey taught me:
• {{learning1}}
• {{learning2}}
• {{learning3}}

Grateful to {{mention}} for the support.

#CareerGrowth #Learning`,

`📢 Internship Announcement

I’m thrilled to start my journey as {{role}} Intern at {{company}}!

I look forward to:
• Learning {{skill1}}
• Working on {{project}}
• Growing professionally

Thank you {{mentor}} for this opportunity.

#Internship #FirstStep`,

`🎓 Certification Update

I’m happy to share that I’ve completed {{course}} from {{platform}}.

Key learnings:
→ {{learning1}}
→ {{learning2}}
→ {{learning3}}

Excited to apply this in real-world projects!

#Upskilling #ProfessionalGrowth`,

`💡 Thought of the Day

In {{industry}}, one thing I’ve realized:

{{insight}}

Consistency and learning matter more than talent.

What do you think?`,

`🏆 Achievement Post

Proud to share I’ve received {{award}}.

This motivates me to continue improving my skills in {{domain}}.

Thankful to everyone who supported me ❤️`
  ],


  /* ================= EMAIL ================= */
  "Email Draft": [

`Subject: Application for {{position}}

Dear {{company}},

I would like to apply for the {{position}} role. My skills in {{skill1}} and {{skill2}} match your requirements.

I have attached my resume for review.

Sincerely,  
{{name}}`,

`Subject: Meeting Request

Hi {{name}},

Can we schedule a meeting regarding {{topic}}?

Available timings:
{{time}}

Regards,  
{{sender}}`,

`Subject: Follow-up

Hello {{name}},

I wanted to follow up regarding {{topic}}.

Please let me know if any additional details are required.

Thank you,  
{{sender}}`,

`Subject: Leave Request

Dear {{manager}},

I would like to request leave on {{date}} due to {{reason}}.

I will ensure all responsibilities are managed.

Thank you.

Regards,  
{{name}}`,

`Subject: Thank You

Dear {{name}},

Thank you for {{reason}}. I truly appreciate your support and guidance.

Best regards,  
{{sender}}`
  ],


  /* ================= AD COPY ================= */
  "Ad Copy": [

`🔥 Introducing {{product}}

Struggling with {{problem}}?

{{product}} helps you:
✔ {{benefit1}}
✔ {{benefit2}}
✔ {{benefit3}}

Try now: {{link}}`,

`LIMITED TIME OFFER!

Get {{discount}}% OFF on {{product}}.

Why choose us?
• {{feature1}}
• {{feature2}}

Shop today → {{link}}`,

`🚀 Upgrade your {{area}}

{{product}} is designed for {{audience}}.

Faster. Smarter. Better.

Order now: {{link}}`,

`Tired of {{painpoint}}?

Switch to {{product}} and experience:
• {{result1}}
• {{result2}}

Start today → {{link}}`,

`New Arrival 🎉

Meet {{product}} — built for {{purpose}}.

Available now at {{website}}`
  ],


  /* ================= BLOG INTRO ================= */
  "Blog Intro": [

`Have you ever wondered about {{topic}}?

In this article, we’ll explore:
• What it is
• Why it matters
• How you can benefit

Let’s begin.`,

`{{topic}} is becoming increasingly important in today’s world.

This blog will help you understand the basics and practical applications.`,

`Many people struggle with {{problem}}.

In this guide, you’ll learn practical solutions and actionable tips.`,

`Whether you are a beginner or experienced, {{topic}} is something you should understand.

This article explains everything in simple terms.`,

`In today’s digital era, {{topic}} plays a vital role.

Let’s explore how it impacts you and your career.`
  ],


  /* ================= TWEET ================= */
  "Tweet": [

`Just learned about {{topic}} 🤯

Key takeaway:
{{insight}}

#learning #growth`,

`Working on {{project}} today 💻

Small steps → Big results 🚀`,

`Tip of the day:
{{tip}}

You’ll thank me later 😉`,

`Excited about {{event}} 🎉

Can’t wait!`,

`{{quote}}

— This changed my perspective.`
  ],


  /* ================= GENERAL ================= */
  "General": [

`Explain {{topic}} in simple terms for a beginner.`,

`Create a step-by-step guide about {{topic}}.`,

`Write a motivational message about {{topic}}.`,

`Provide advantages and disadvantages of {{topic}}.`,

`Give a real-life example explaining {{topic}} clearly.`
  ]
};
