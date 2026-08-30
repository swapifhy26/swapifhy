const fs = require('fs');
let code = fs.readFileSync('src/pages/progress.tsx', 'utf8');

// Update state initialization
code = code.replace(
    'const [stats, setStats] = useState({ totalSwaps: 0, hoursLearned: 0, hoursTaught: 0, avgRating: 0, studentsTaught: 0 });',
    'const [stats, setStats] = useState({ totalSwaps: 0, hoursLearned: 0, hoursTaught: 0, avgRating: 0, studentsTaught: 0, currentStreak: 0, highestStreak: 0 });'
);

// Update setStats call
code = code.replace(
    'studentsTaught: mentData.teaching?.length || 0',
    'studentsTaught: mentData.teaching?.length || 0,\n                    currentStreak: profData.user.currentStreak ?? 0,\n                    highestStreak: profData.user.highestStreak ?? 0'
);

// Update Streak Bar JSX
code = code.replace(
    '3-Day Streak!',
    '{stats.currentStreak}-Day Streak!'
);

code = code.replace(
    '<span className="text-orange-500">Day 3 (You)</span>',
    '<span className="text-orange-500">Day {stats.currentStreak} (You)</span>'
);

// Calculate progress width for the bar
code = code.replace(
    'animate={{ width: "42%" }}',
    'animate={{ width: `${Math.min((stats.currentStreak / 7) * 100, 100)}%` }}'
);

fs.writeFileSync('src/pages/progress.tsx', code);
console.log("Wired up real streak data to Progress page");
