import { MotivationQuote, MotivationCategory } from '../types';

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  // Starting the morning (16 quotes)
  { id: 'm1', text: "The dawn does not ask for perfection; it only asks you to arrive.", category: 'morning' },
  { id: 'm2', text: "Before the world demands your attention, give this first quiet hour to yourself.", category: 'morning' },
  { id: 'm3', text: "Today is an unwritten page. How you begin determines the rhythm of the story.", category: 'morning' },
  { id: 'm4', text: "Breathe in the stillness. You are here, awake, and capable of remarkable change.", category: 'morning' },
  { id: 'm5', text: "A conscious morning is a quiet declaration that your life belongs to you.", category: 'morning' },
  { id: 'm6', text: "Rise gently. You do not need to rush; steady presence carries greater strength.", category: 'morning' },
  { id: 'm7', text: "Each sunrise brings an equal opportunity to choose alignment over impulse.", category: 'morning' },
  { id: 'm8', text: "Your future self will thank you for the calm dignity you cultivate this morning.", category: 'morning' },
  { id: 'm9', text: "The quietest moments of the morning often build the loudest triumphs of the day.", category: 'morning' },
  { id: 'm10', text: "Greet the day with curiosity rather than pressure. What might you discover about yourself?", category: 'morning' },
  { id: 'm11', text: "You woke up today because your story still has vital chapters waiting to be lived.", category: 'morning' },
  { id: 'm12', text: "Let go of yesterday's weight. The morning sun sheds new light on every step.", category: 'morning' },
  { id: 'm13', text: "Mastering your morning is not about speed; it is about anchoring your soul in peace.", category: 'morning' },
  { id: 'm14', text: "Clear your mind, soften your shoulders, and welcome what this new day has to teach.", category: 'morning' },
  { id: 'm15', text: "True victory begins before breakfast—in the silence where you choose who you will be.", category: 'morning' },
  { id: 'm16', text: "Step into today with gratitude. You are equipped with everything you need to begin.", category: 'morning' },

  // Completing rituals (15 quotes)
  { id: 'rc1', text: "You showed up for yourself today. That promise kept is the bedrock of confidence.", category: 'ritual_complete' },
  { id: 'rc2', text: "Ritual complete. Carry this grounded stillness into every interaction ahead.", category: 'ritual_complete' },
  { id: 'rc3', text: "You have nourished mind, body, and spirit. Walk into your day with quiet power.", category: 'ritual_complete' },
  { id: 'rc4', text: "The discipline of this morning will echo through every decision you make today.", category: 'ritual_complete' },
  { id: 'rc5', text: "You chose growth over comfort this morning. Take pride in that silent courage.", category: 'ritual_complete' },
  { id: 'rc6', text: "The foundation is poured. Whatever the day brings, you meet it centered and steady.", category: 'ritual_complete' },
  { id: 'rc7', text: "By honoring your morning rituals, you set an unshakeable standard for self-respect.", category: 'ritual_complete' },
  { id: 'rc8', text: "Well done. You have conquered the first and most meaningful hour of your day.", category: 'ritual_complete' },
  { id: 'rc9', text: "Carry the warmth of this practice like a lantern into whatever storms arise.", category: 'ritual_complete' },
  { id: 'rc10', text: "You did not just complete a checklist; you invested in your deepest character.", category: 'ritual_complete' },
  { id: 'rc11', text: "Momentum is yours. Let the clarity of your morning lead you through every task.", category: 'ritual_complete' },
  { id: 'rc12', text: "A mindful morning is complete. Breathe in the accomplishment; you are ready.", category: 'ritual_complete' },
  { id: 'rc13', text: "Small acts of daily reverence build a life of profound resilience.", category: 'ritual_complete' },
  { id: 'rc14', text: "You have filled your cup first. Now you can give to the world from abundance.", category: 'ritual_complete' },
  { id: 'rc15', text: "Stand tall. You chose yourself this morning, and that choice changes everything.", category: 'ritual_complete' },

  // Maintaining consistency (16 quotes)
  { id: 'c1', text: "Consistency is not about feeling inspired every day; it is about honoring the rhythm.", category: 'consistency' },
  { id: 'c2', text: "A river carves through stone not through brute force, but through faithful persistence.", category: 'consistency' },
  { id: 'c3', text: "Great lives are not built by grand gestures, but by quiet habits repeated with love.", category: 'consistency' },
  { id: 'c4', text: "When motivation wanes, trust the habit. It knows the way forward when feelings waver.", category: 'consistency' },
  { id: 'c5', text: "One day at a time is not a limitation; it is the only true way mountains are climbed.", category: 'consistency' },
  { id: 'c6', text: "The secret of mastery is falling in love with the unglamorous daily practice.", category: 'consistency' },
  { id: 'c7', text: "Repetition is the language the nervous system understands. You are rewiring your future.", category: 'consistency' },
  { id: 'c8', text: "You do not need to be extraordinary today; you simply need to be present and consistent.", category: 'consistency' },
  { id: 'c9', text: "Every time you keep a small promise to yourself, your self-trust deepens.", category: 'consistency' },
  { id: 'c10', text: "The compounding interest of daily discipline produces freedom beyond measure.", category: 'consistency' },
  { id: 'c11', text: "Focus on the process today. The outcomes will quietly take care of themselves.", category: 'consistency' },
  { id: 'c12', text: "Dignity is forged in the quiet days when nobody is watching your devotion.", category: 'consistency' },
  { id: 'c13', text: "Stay patient with your journey. True transformation takes root underground first.", category: 'consistency' },
  { id: 'c14', text: "Show up even when your mind offers clever excuses. That is where growth lives.", category: 'consistency' },
  { id: 'c15', text: "Keep placing one stone each day. Before long, you will look back on a cathedral.", category: 'consistency' },
  { id: 'c16', text: "Loyalty to your own evolution is the highest form of self-love you can practice.", category: 'consistency' },

  // Reaching personal milestones (15 quotes)
  { id: 'ms1', text: "Look at how far your quiet dedication has brought you. Celebrate this milestone.", category: 'milestone' },
  { id: 'ms2', text: "This milestone is proof that you have the internal power to reshape your reality.", category: 'milestone' },
  { id: 'ms3', text: "What once felt impossible is now your baseline. Honor the courage it took to reach here.", category: 'milestone' },
  { id: 'ms4', text: "You are not the same person who began this journey. Your strength has deepened.", category: 'milestone' },
  { id: 'ms5', text: "Mark this moment. You proved to yourself that you are capable of steadfast discipline.", category: 'milestone' },
  { id: 'ms6', text: "Milestones are markers on a lifelong path. Enjoy the view, then keep walking forward.", category: 'milestone' },
  { id: 'ms7', text: "Your commitment has borne fruit. Let this victory be your fuel for the days ahead.", category: 'milestone' },
  { id: 'ms8', text: "Every day counted, every urge resisted, every morning greeted. You earned this achievement.", category: 'milestone' },
  { id: 'ms9', text: "True pride is quiet. Feel the peace of knowing you are living in integrity.", category: 'milestone' },
  { id: 'ms10', text: "This streak is not luck; it is hundreds of conscious decisions working in harmony.", category: 'milestone' },
  { id: 'ms11', text: "Take a deep breath and feel the weight of this accomplishment. You are doing it.", category: 'milestone' },
  { id: 'ms12', text: "You have built new mental pathways where old impulses used to reign. Bravo.", category: 'milestone' },
  { id: 'ms13', text: "A milestone reached is a lantern illuminating your next horizon of growth.", category: 'milestone' },
  { id: 'ms14', text: "Celebrate without complacency. You have built a temple; now continue to dwell in it.", category: 'milestone' },
  { id: 'ms15', text: "Honor the resilience that carried you through the difficult hours to reach this day.", category: 'milestone' },

  // Difficult days (16 quotes)
  { id: 'd1', text: "An urge is just a wave. You do not have to fight the ocean; simply let it break on the shore.", category: 'difficult_days' },
  { id: 'd2', text: "Discomfort is not a sign of failure; it is the physical sensation of old patterns loosening.", category: 'difficult_days' },
  { id: 'd3', text: "Breathe into the tension. You have survived every hard day before this one.", category: 'difficult_days' },
  { id: 'd4', text: "You are far stronger than a passing chemical craving. Root yourself in this exact moment.", category: 'difficult_days' },
  { id: 'd5', text: "When everything feels heavy, your only job is to get through the next ten minutes cleanly.", category: 'difficult_days' },
  { id: 'd6', text: "Do not negotiate with temporary impulses. Your long-term peace is worth defending.", category: 'difficult_days' },
  { id: 'd7', text: "Put both feet firmly on the ground. You are safe. The storm inside will pass.", category: 'difficult_days' },
  { id: 'd8', text: "Strength is not the absence of struggle; it is choosing your values while the struggle rages.", category: 'difficult_days' },
  { id: 'd9', text: "Treat yourself with gentleness right now. White-knuckling exhausts; self-compassion endures.", category: 'difficult_days' },
  { id: 'd10', text: "Change your scenery, splash cold water on your face, and let your body reset.", category: 'difficult_days' },
  { id: 'd11', text: "The craving will peak and then dissolve. Ride it out like a seasoned navigator.", category: 'difficult_days' },
  { id: 'd12', text: "Remember why you started. That clarity is still inside you, beneath the surface noise.", category: 'difficult_days' },
  { id: 'd13', text: "You are not your thoughts, and you are not your urges. You are the observer who chooses.", category: 'difficult_days' },
  { id: 'd14', text: "A difficult day navigated with integrity is worth ten easy days in personal growth.", category: 'difficult_days' },
  { id: 'd15', text: "Release the need to feel great today. Simply choose to remain in integrity.", category: 'difficult_days' },
  { id: 'd16', text: "This feeling has an expiration timestamp. Your self-respect lasts forever.", category: 'difficult_days' },

  // Missed routines & Setbacks (15 quotes)
  { id: 'mr1', text: "A setback does not erase the strength you developed. Stand up, dust off, and begin anew.", category: 'missed_routines' },
  { id: 'mr2', text: "Shame builds walls; compassion builds bridges back to your path. Be kind to yourself.", category: 'missed_routines' },
  { id: 'mr3', text: "Missing a day is an event, not an identity. Your commitment remains intact.", category: 'missed_routines' },
  { id: 'mr4', text: "Do not dwell in regret. The only moment that matters is the choice you make right now.", category: 'missed_routines' },
  { id: 'mr5', text: "Growth is rarely a straight diagonal. Spirals and stumbles are part of every ascent.", category: 'missed_routines' },
  { id: 'mr6', text: "Ask what this moment can teach you, then gently return to your practice without self-recrimination.", category: 'missed_routines' },
  { id: 'mr7', text: "Your history of clean days and mindful mornings is still written in your character.", category: 'missed_routines' },
  { id: 'mr8', text: "Release perfectionism. The true test of discipline is the speed with which you gently restart.", category: 'missed_routines' },
  { id: 'mr9', text: "Yesterday ended last night. Today is completely fresh and welcoming your return.", category: 'missed_routines' },
  { id: 'mr10', text: "Do not abandon the voyage because of one rough wave. Steady the helm and steer forward.", category: 'missed_routines' },
  { id: 'mr11', text: "Self-forgiveness is the sharpest tool for long-term consistency.", category: 'missed_routines' },
  { id: 'mr12', text: "Every master was once a student who refused to let a mistake define the journey.", category: 'missed_routines' },
  { id: 'mr13', text: "Take one clean breath, one clean choice, and you are immediately back on the path.", category: 'missed_routines' },
  { id: 'mr14', text: "Treat yourself as you would a dear friend: with firm encouragement and tender understanding.", category: 'missed_routines' },
  { id: 'mr15', text: "The reset button is a gift of grace. Press it with clear eyes and renewed resolve.", category: 'missed_routines' },

  // Evening reflection (15 quotes)
  { id: 'e1', text: "The day is done. Lay down your burdens and allow your mind and body to rest.", category: 'evening' },
  { id: 'e2', text: "Reflect on today with gratitude. You navigated another full cycle of life.", category: 'evening' },
  { id: 'e3', text: "Whatever was left undone today can wait for tomorrow. Your peace tonight is paramount.", category: 'evening' },
  { id: 'e4', text: "Sleep is the sacred renewal that prepares you for tomorrow's dawn. Rest deeply.", category: 'evening' },
  { id: 'e5', text: "Acknowledge the moments you stayed grounded today. You did good work.", category: 'evening' },
  { id: 'e6', text: "Release the mental replay of the day. Let the quiet darkness restore your clarity.", category: 'evening' },
  { id: 'e7', text: "Rest is not a reward for work completed; it is a fundamental pillar of your health.", category: 'evening' },
  { id: 'e8', text: "Count three small blessings from today before you close your eyes.", category: 'evening' },
  { id: 'e9', text: "Tomorrow begins with how tenderly you allow yourself to unwind tonight.", category: 'evening' },
  { id: 'e10', text: "You walked through today in integrity. That peace in your chest is well earned.", category: 'evening' },
  { id: 'e11', text: "Softly breathe out the tension of the day. You are safe in this quiet evening.", category: 'evening' },
  { id: 'e12', text: "Honor your effort today. Even small steps moved you in the right direction.", category: 'evening' },
  { id: 'e13', text: "Close the book on today with forgiveness for anything that did not go as planned.", category: 'evening' },
  { id: 'e14', text: "The stars shine brightest against a dark sky. Rest in anticipation of a new dawn.", category: 'evening' },
  { id: 'e15', text: "Peace is your birthright. Let it settle over you as night wraps around the world.", category: 'evening' },
];

/**
 * Returns a quote filtered by category, or a random quote if category is omitted
 */
export function getRandomMotivation(category?: MotivationCategory): MotivationQuote {
  const pool = category 
    ? MOTIVATION_QUOTES.filter(q => q.category === category)
    : MOTIVATION_QUOTES;
  
  if (pool.length === 0) {
    return MOTIVATION_QUOTES[0];
  }
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Context-aware motivational quote selector based on time of day and ritual progress
 */
export function getContextualMotivation(options?: {
  hour?: number;
  ritualsCompletedToday?: number;
  totalRituals?: number;
  isStruggling?: boolean;
}): MotivationQuote {
  const hour = options?.hour ?? new Date().getHours();
  const completed = options?.ritualsCompletedToday ?? 0;
  const total = options?.totalRituals ?? 6;

  if (options?.isStruggling) {
    return getRandomMotivation('difficult_days');
  }

  // Morning: 4 AM to 11 AM
  if (hour >= 4 && hour < 12) {
    if (completed >= total && total > 0) {
      return getRandomMotivation('ritual_complete');
    }
    return getRandomMotivation('morning');
  }

  // Afternoon: 12 PM to 5 PM
  if (hour >= 12 && hour < 18) {
    if (completed === 0) {
      return getRandomMotivation('missed_routines');
    }
    return getRandomMotivation('consistency');
  }

  // Evening / Night: 6 PM to 3 AM
  return getRandomMotivation('evening');
}
