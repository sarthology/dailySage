import type { Philosopher } from "@/types/philosophy";

export const philosophers: Philosopher[] = [
  {
    name: "Marcus Aurelius",
    school: "stoicism",
    era: "121-180 CE",
    bio: "Roman Emperor and Stoic philosopher whose private journal, Meditations, became one of the most influential works of philosophy.",
    keyIdeas: ["Dichotomy of control", "Memento mori", "Amor fati", "The view from above"],
    quotes: [
      {
        text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
        source: "Meditations",
        moodTags: ["anxious", "overwhelmed", "powerless"],
        situationTags: ["work", "uncertainty", "control"],
      },
      {
        text: "The happiness of your life depends upon the quality of your thoughts.",
        source: "Meditations",
        moodTags: ["sad", "negative", "ruminating"],
        situationTags: ["self", "mindset", "daily"],
      },
      {
        text: "Waste no more time arguing about what a good man should be. Be one.",
        source: "Meditations",
        moodTags: ["indecisive", "stuck", "procrastinating"],
        situationTags: ["purpose", "action", "growth"],
      },
    ],
  },
  {
    name: "Epictetus",
    school: "stoicism",
    era: "50-135 CE",
    bio: "Born a slave, became one of the most influential Stoic teachers. His teachings focus on what is truly within our power.",
    keyIdeas: ["What is up to us", "Prohairesis (moral choice)", "Practicing virtue daily"],
    quotes: [
      {
        text: "It's not what happens to you, but how you react to it that matters.",
        source: "Discourses",
        moodTags: ["angry", "frustrated", "reactive"],
        situationTags: ["conflict", "setback", "relationships"],
      },
      {
        text: "First say to yourself what you would be; and then do what you have to do.",
        source: "Discourses",
        moodTags: ["lost", "directionless", "unmotivated"],
        situationTags: ["purpose", "career", "goals"],
      },
    ],
  },
  {
    name: "Seneca",
    school: "stoicism",
    era: "4 BCE - 65 CE",
    bio: "Roman statesman, dramatist, and philosopher. His letters and essays offer practical wisdom for daily living.",
    keyIdeas: ["Premeditatio malorum", "On the shortness of life", "Practical ethics"],
    quotes: [
      {
        text: "We suffer more often in imagination than in reality.",
        source: "Letters to Lucilius",
        moodTags: ["anxious", "worried", "catastrophizing"],
        situationTags: ["future", "anxiety", "health"],
      },
      {
        text: "It is not that we have a short time to live, but that we waste a great deal of it.",
        source: "On the Shortness of Life",
        moodTags: ["regretful", "rushed", "overwhelmed"],
        situationTags: ["time", "priorities", "purpose"],
      },
    ],
  },
];
