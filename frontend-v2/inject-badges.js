const fs = require('fs');
let code = fs.readFileSync('src/pages/progress.tsx', 'utf8');

// 1. Ensure Flame is imported
if (!code.includes('Flame,')) {
    code = code.replace(
        'import { TrendingUp',
        'import { Flame, TrendingUp'
    );
}

// 2. Update BADGE_DEFINITIONS
const newBadges = `
const BADGE_DEFINITIONS = [
    { id: "early_bird", name: "Early Bird", description: "Complete your first swap", icon: <Zap className="w-5 h-5" />, color: "bg-amber-500", check: (s: any) => s.totalSwaps >= 1 },
    { id: "dedicated_learner", name: "Dedicated Learner", description: "Learn for 10+ hours", icon: <BookOpen className="w-5 h-5" />, color: "bg-primary", check: (s: any) => s.hoursLearned >= 10 },
    { id: "master_mentor", name: "Master Mentor", description: "Teach 5+ students", icon: <Award className="w-5 h-5" />, color: "bg-rose-500", check: (s: any) => s.studentsTaught >= 5 },
    { id: "top_rated", name: "Top Rated", description: "Maintain a 4.8+ avg rating", icon: <Star className="w-5 h-5" />, color: "bg-teal-500", check: (s: any) => s.avgRating >= 4.8 },
    
    // STREAK BADGES
    { id: "streak_1", name: "First Spark", description: "1-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-orange-400", check: (s: any) => s.highestStreak >= 1 },
    { id: "streak_7", name: "Weekly Warrior", description: "7-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-orange-500", check: (s: any) => s.highestStreak >= 7 },
    { id: "streak_30", name: "Monthly Master", description: "30-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-red-500", check: (s: any) => s.highestStreak >= 30 },
    { id: "streak_60", name: "Sixty-Day Sage", description: "60-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-rose-500", check: (s: any) => s.highestStreak >= 60 },
    { id: "streak_90", name: "Quarterly Quest", description: "90-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-pink-500", check: (s: any) => s.highestStreak >= 90 },
    { id: "streak_100", name: "Century Club", description: "100-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-purple-500", check: (s: any) => s.highestStreak >= 100 },
    { id: "streak_120", name: "Relentless", description: "120-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-violet-500", check: (s: any) => s.highestStreak >= 120 },
    { id: "streak_160", name: "Unstoppable", description: "160-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-indigo-500", check: (s: any) => s.highestStreak >= 160 },
    { id: "streak_200", name: "Legendary Flame", description: "200-Day Streak", icon: <Flame className="w-5 h-5" />, color: "bg-slate-900", check: (s: any) => s.highestStreak >= 200 }
];
`;

const replaceRegex = /const BADGE_DEFINITIONS = \[[\s\S]*?\];/;
if (replaceRegex.test(code)) {
    code = code.replace(replaceRegex, newBadges.trim());
    fs.writeFileSync('src/pages/progress.tsx', code);
    console.log("Injected Streak Badges");
} else {
    console.log("Could not find BADGE_DEFINITIONS array.");
}
