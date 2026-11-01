export interface SupportAlternative {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'physical' | 'environment' | 'mind' | 'social';
}

export const SUPPORT_ALTERNATIVES: SupportAlternative[] = [
  {
    id: 'ice-water',
    title: 'Drink Cold Water',
    description: 'Slowly sip a glass of very cold water. Feel the temperature shift activate your vagus nerve and ground your physiology.',
    icon: 'Droplet',
    category: 'physical',
  },
  {
    id: 'pushups',
    title: 'Physical Reset (15-20 Reps)',
    description: 'Do push-ups, squats, or jumping jacks. Channel the surge of dopamine and adrenaline into muscular effort.',
    icon: 'Activity',
    category: 'physical',
  },
  {
    id: 'step-outside',
    title: 'Step Outside for Fresh Air',
    description: 'Change your physical environment immediately. Look toward the distant horizon to expand your peripheral vision and lower alertness.',
    icon: 'Sun',
    category: 'environment',
  },
  {
    id: 'cold-splash',
    title: 'Splash Cold Water on Face',
    description: 'Trigger the mammalian dive reflex by splashing cold water on your forehead and eyes. It naturally lowers your heart rate.',
    icon: 'Sparkles',
    category: 'physical',
  },
  {
    id: 'call-friend',
    title: 'Reach Out to a Friend',
    description: 'Send a quick text or voice note checking in on someone you care about. Human connection dissolves isolation.',
    icon: 'MessageCircle',
    category: 'social',
  },
  {
    id: 'write-urge',
    title: 'Stream of Consciousness Journal',
    description: 'Grab a pen and write down exactly what emotions, boredom, loneliness, or fatigue you are experiencing right now.',
    icon: 'PenTool',
    category: 'mind',
  },
];

export const GROUNDING_STEPS = [
  { count: 5, sense: 'Things you can SEE', prompt: 'Acknowledge 5 things around you. Notice the light, shapes, colors, or textures.' },
  { count: 4, sense: 'Things you can TOUCH', prompt: 'Notice 4 physical sensations: the floor under your feet, the fabric of your shirt, the air on your skin.' },
  { count: 3, sense: 'Things you can HEAR', prompt: 'Listen carefully for 3 subtle sounds in your environment or in the distance.' },
  { count: 2, sense: 'Things you can SMELL', prompt: 'Notice 2 scents in the air, or take a deep whiff of fresh air or coffee.' },
  { count: 1, sense: 'Thing you can TASTE', prompt: 'Notice the current taste in your mouth, or take a sip of water.' },
];

export const TRIGGER_OPTIONS = [
  'Boredom / Seeking stimulation',
  'Loneliness / Craving connection',
  'Stress / Work pressure',
  'Fatigue / Late night tiredness',
  'Anxiety / Overwhelm',
  'Procrastination on important work',
  'Habitual routine / Bedroom cue',
  'Digital browsing / Social media rabbit hole',
];
