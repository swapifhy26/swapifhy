# Swapifhy - Interaction Design Document

## Core User Flows

### 1. Onboarding Flow (Dual-Role Setup)
**Primary Flow**: New user registration and skill setup
- **Welcome Screen**: Animated turtle mascot waves and guides user
- **Account Creation**: Email/password or social login
- **Dual-Role Setup**: 
  - "What I Can Teach" - skill selection with proficiency levels (Beginner/Intermediate/Expert)
  - "What I Want to Learn" - skill selection with interest levels
  - Tag-based system with autocomplete and popular suggestions
- **Motivation Selection**: Choose from Career, Creativity, Social, Curiosity
- **Profile Enhancement**: Optional video/audio intro upload
- **First Match Suggestion**: Immediate personalized recommendations

### 2. Explore & Matching Flow
**Primary Flow**: Discover and connect with skill partners
- **3D World Map**: Interactive globe showing active swaps as glowing dots
  - Real-time animation of completed swaps lighting up
  - Turtle mascot swims across map to highlight recent activity
- **Filter Panel**: Skill categories, location, time zone, motivation type
- **Smart Matching**: AI-powered suggestions based on:
  - Skill complementarity (teach/learn overlap)
  - Activity score and completion rate
  - Reciprocity history and ratings
- **Profile Cards**: 3D flip animations showing teach/learn skills
- **Connection Request**: Animated button with turtle celebration on match

### 3. Communication Flow
**Primary Flow**: Real-time chat and meeting coordination
- **Chat Interface**: 
  - Real-time messaging with typing indicators
  - Attachment support (images, short recordings)
  - Message delivery and read receipts
  - Turtle mascot animations for new messages
- **Meeting Scheduler**:
  - Calendar integration (Google/Outlook)
  - Time zone aware booking
  - Zoom integration or embedded WebRTC
  - Meeting reminders and preparation checklist
- **Session Completion**: 
  - Rating and feedback system
  - Credit point allocation
  - Badge awarding with celebration animation

### 4. Progress & Gamification Flow
**Primary Flow**: Track learning goals and earn rewards
- **Personal Dashboard**: 
  - Active swaps overview
  - Skill progress bars with 3D visualization
  - Streak counters and XP points
  - Achievement badges display
- **Goal Setting**: 
  - Create skill learning objectives
  - Set completion criteria
  - Track session milestones
- **Credit System**: 
  - Earn credits for completed swaps
  - Redeem for events, workshops, or perks
  - Leaderboard with turtle mascot celebrations

## 3D Animation Specifications

### Turtle M mascot Animations (glTF format)
1. **Idle**: Gentle breathing, occasional blinks
2. **Wave**: Friendly greeting for onboarding
3. **Celebrate**: Jumping and spinning for achievements
4. **Guide**: Pointing and gesturing for tutorials
5. **Thinking**: Tapping shell, looking up for processing states
6. **Sleepy**: Yawning and slow movements for error states

### UI Animation Patterns
- **Page Transitions**: Smooth slide with depth perspective
- **Button Interactions**: 3D tilt and glow effects
- **Card Hover**: Lift and shadow expansion
- **Loading States**: Turtle mascot swimming in progress bars
- **Success States**: Particle effects with mascot celebration

## Interactive Components

### 1. 3D Skill Selector
- Rotating 3D skill icons
- Drag to browse, tap to select
- Visual feedback with color coding
- Proficiency level slider with turtle guidance

### 2. Interactive World Map
- Three.js powered 3D globe
- Real-time swap visualization
- Click regions to filter by geography
- Turtle mascot navigation overlay

### 3. Meeting Room Interface
- 3D meeting lobby with participant avatars
- Screen sharing with 3D presentation mode
- Interactive whiteboard with drawing tools
- Recording and session capture

### 4. Progress Visualization
- 3D skill tree with branching paths
- Animated progress bars with milestones
- Achievement unlock animations
- Credit point accumulation effects

## Accessibility & Performance
- Reduced motion fallbacks for all animations
- Keyboard navigation for 3D elements
- Screen reader compatible alt text
- Progressive loading for 3D assets
- Mobile-optimized touch interactions
- 60fps target with 30fps fallbacks

## Data Requirements
- User profiles with skill matrices
- Real-time messaging system
- Calendar and meeting data
- Progress tracking and analytics
- Credit point ledger system
- Achievement and badge definitions