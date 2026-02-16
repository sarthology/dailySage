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
  {
    name: "Albert Camus",
    school: "absurdism",
    era: "1913-1960",
    bio: "French-Algerian philosopher and author who explored the absurd condition — the conflict between our desire for meaning and the universe's silence.",
    keyIdeas: ["The Absurd", "Revolt against meaninglessness", "One must imagine Sisyphus happy"],
    quotes: [
      {
        text: "In the midst of winter, I found there was, within me, an invincible summer.",
        source: "Return to Tipasa",
        moodTags: ["despairing", "hopeless", "dark"],
        situationTags: ["crisis", "resilience", "self"],
      },
      {
        text: "The struggle itself towards the heights is enough to fill a man's heart. One must imagine Sisyphus happy.",
        source: "The Myth of Sisyphus",
        moodTags: ["exhausted", "burned_out", "purposeless"],
        situationTags: ["work", "meaning", "perseverance"],
      },
    ],
  },
  {
    name: "Thich Nhat Hanh",
    school: "buddhism",
    era: "1926-2022",
    bio: "Vietnamese Zen Buddhist monk, peace activist, and author who brought mindfulness to the Western world through simple, profound teachings.",
    keyIdeas: ["Mindfulness", "Interbeing", "Present moment awareness", "Compassionate listening"],
    quotes: [
      {
        text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
        moodTags: ["anxious", "overwhelmed", "scattered"],
        situationTags: ["mindfulness", "daily", "grounding"],
      },
      {
        text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
        moodTags: ["numb", "disconnected", "joyless"],
        situationTags: ["presence", "gratitude", "daily"],
      },
    ],
  },
  {
    name: "Epicurus",
    school: "epicureanism",
    era: "341-270 BCE",
    bio: "Greek philosopher who taught that the greatest good is to seek modest pleasures, attain tranquility, and free oneself from fear.",
    keyIdeas: ["Ataraxia (tranquility)", "Simple pleasures", "Friendship as highest good"],
    quotes: [
      {
        text: "Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.",
        moodTags: ["dissatisfied", "envious", "restless"],
        situationTags: ["gratitude", "materialism", "contentment"],
      },
      {
        text: "Of all the means to ensure happiness throughout the whole of life, by far the most important is the acquisition of friends.",
        moodTags: ["lonely", "isolated", "disconnected"],
        situationTags: ["relationships", "community", "belonging"],
      },
    ],
  },
  {
    name: "Laozi",
    school: "taoism",
    era: "6th Century BCE",
    bio: "Legendary Chinese philosopher and author of the Tao Te Ching, which teaches the art of living in harmony with the natural way of things.",
    keyIdeas: ["Wu wei (non-action)", "The Tao", "Simplicity", "Water as teacher"],
    quotes: [
      {
        text: "Nature does not hurry, yet everything is accomplished.",
        moodTags: ["rushed", "impatient", "overwhelmed"],
        situationTags: ["work", "productivity", "patience"],
      },
      {
        text: "When I let go of what I am, I become what I might be.",
        moodTags: ["stuck", "rigid", "afraid_of_change"],
        situationTags: ["growth", "identity", "transition"],
      },
    ],
  },
  {
    name: "Simone de Beauvoir",
    school: "existentialism",
    era: "1908-1986",
    bio: "French existentialist philosopher who explored freedom, ethics, and the construction of identity, particularly regarding gender and oppression.",
    keyIdeas: ["Freedom and responsibility", "Ambiguity of existence", "Authentic living"],
    quotes: [
      {
        text: "One is not born, but rather becomes. Change is not merely necessary to life — it is life.",
        moodTags: ["uncertain", "transitioning", "growing"],
        situationTags: ["identity", "change", "growth"],
      },
    ],
  },
];
