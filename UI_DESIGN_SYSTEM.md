# GullyGram UI/UX Design System

## 🎨 Design Philosophy

GullyGram is a **location-based social media platform** that combines:
- **Local Discovery** - Connect with people and content within your radius
- **Privacy-First** - Alias-based identity with trust-based real name reveal
- **Interest-Driven** - Content matching your passions and hobbies
- **Community-Focused** - Local events, marketplace, and connections

---

## 📱 Screen Designs

### 1. Landing Screen
![Landing Screen](landing_screen_1769612927698.png)

**Key Features:**
- Vibrant purple-blue gradient establishing brand identity
- Subtle map pattern reinforcing location concept
- Clear value proposition: "Connect Locally, Discover Nearby"
- Location radius preview (10-20km)
- Floating interest tags showing variety
- Prominent CTA buttons (Sign Up primary, Login secondary)

**Design Principles:**
- **First Impression**: Modern, trustworthy, vibrant
- **Clear Purpose**: Immediately communicates location-based social
- **Engaging**: Interest tags create curiosity

---

### 2. Signup Screen
![Signup Screen](signup_screen_1769613286133.png)

**Key Features:**
- Clean, minimal form design
- Email/Phone toggle for flexibility
- Alias (@username) - emphasized as primary identity
- Real Name marked as optional
- Password with show/hide toggle
- OTP signup option
- Purple accent color for brand consistency

**UX Considerations:**
- **Privacy First**: Alias is required, real name optional
- **Flexibility**: Multiple signup methods (email/phone/OTP)
- **Clear Hierarchy**: Most important fields first
- **Easy Navigation**: "Already have account?" at bottom

---

### 3. Interests Selection (Onboarding Step 1)
![Interests Screen](interests_screen_1769613590445.png)

**Key Features:**
- Colorful, engaging interest cards
- Each card has unique color and icon
- Multi-selection with checkmarks
- Progress indicator (Step 1 of 2)
- Clear instructions and next action

**Available Interests:**
- 💪 Bodybuilding (Orange)
- 📚 Books (Teal)
- 💃 Dance (Pink)
- 🎵 Music (Purple) - Selected
- ⚽ Sports (Green)
- 💻 Technology (Blue)
- 🍕 Food (Red)
- ✈️ Travel (Cyan)
- 📷 Photography (Yellow) - Selected

**Design Strategy:**
- **Visual Appeal**: Gradients and icons make selection fun
- **Clear Feedback**: Selected items have glow + checkmark
- **Personality**: Colors reflect interest categories
- **Engagement**: Encourages multiple selections

---

### 4. Radius Selection (Onboarding Step 2)
![Radius Onboarding](radius_onboarding_1769614574427.png)

**Key Features:**
- Visual map representation of radius concept
- Concentric circles showing coverage area
- Two clear options: 10km vs 20km
- Descriptive labels for each choice
- "Can change anytime" reassurance

**Options:**
- **10km** - Smaller area, focused discoveries
- **20km** - Wider area, exploring new gems (Selected)

**Why This Works:**
- **Visual Learning**: Map shows exactly what radius means
- **Clear Choice**: Two options prevent decision paralysis
- **Reassurance**: Users know they can change later
- **Completion**: Final onboarding step before main app

---

### 5. Feed Screen
![Feed Screen](feed_screen_1769614960646.png)

**Key Features:**
- **Top Bar**: GullyGram logo, radius selector (10km), filter button
- **Location Badge**: Current city with green online indicator
- **Post Cards**: Glassmorphism effect with gradient background
- **User Info**: Alias, avatar, timestamp, distance
- **Content**: Post text with readability
- **Interest Tags**: Colored pills (#Bodybuilding, #Fitness)
- **Engagement**: Like/comment/share counts with icons
- **FAB**: Floating action button for creating posts
- **Bottom Nav**: Home, Events, Marketplace, Profile

**Post Anatomy:**
```
┌─────────────────────────┐
│ @alias  •  2h ago • 5km │ ← Identity + Context
├─────────────────────────┤
│ Post content text...    │ ← Main Content
│ #tag1 #tag2             │ ← Interest Tags
│ ♥ 1.2k  💬 250  🔗 85  │ ← Engagement
└─────────────────────────┘
```

**UX Highlights:**
- **Distance Awareness**: Every post shows proximity
- **Quick Actions**: One-tap like/comment
- **Visual Hierarchy**: Username → Content → Tags → Actions
- **Vibrant**: Gradient backgrounds create energy

---

### 6. Profile Screen
![Profile Screen](profile_screen_1769614260946.png)

**Key Features:**
- **Cover Gradient**: Purple-blue brand colors
- **Avatar**: Large, editable, circular
- **Primary Identity**: @alias prominently displayed
- **Trust-Based**: Real Name with lock icon (friend-only)
- **Bio**: Short description
- **Stats**: Posts, Friends, Nearby count
- **Radius Control**: Interactive slider (10-20km)
- **Interest Tags**: Visual display of selected interests
- **Action**: Edit Profile button
- **Tabs**: Posts, Events, Saved content
- **Settings**: Gear icon top-right

**Privacy Design:**
- **Alias First**: Always visible, primary identifier
- **Real Name Gated**: Lock icon shows it's restricted
- **User Control**: Radius slider for personalization

---

## 🎨 Design System

### Color Palette

**Primary Colors:**
```css
--primary-purple: #6B46C1
--primary-blue: #3B82F6
--gradient-primary: linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%)
```

**Secondary Colors:**
```css
--orange: #F97316  /* Bodybuilding, Food */
--teal: #14B8A6    /* Books, Travel */
--pink: #EC4899    /* Dance */
--green: #10B981   /* Sports, Success */
--yellow: #FBBF24  /* Photography */
--red: #EF4444     /* Urgent, Delete */
```

**Neutral Colors:**
```css
--white: #FFFFFF
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-600: #4B5563
--gray-900: #111827
--black: #000000
```

**Semantic Colors:**
```css
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6
```

### Typography

**Font Family:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Font Sizes:**
```css
--text-xs: 12px    /* Labels, captions */
--text-sm: 14px    /* Body text, secondary */
--text-base: 16px  /* Primary body */
--text-lg: 18px    /* Emphasized text */
--text-xl: 20px    /* Headings */
--text-2xl: 24px   /* Page titles */
--text-3xl: 30px   /* Hero text */
--text-4xl: 36px   /* Logo */
```

**Font Weights:**
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing System

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

### Border Radius

```css
--radius-sm: 8px   /* Small elements */
--radius-md: 12px  /* Cards, buttons */
--radius-lg: 16px  /* Large cards */
--radius-xl: 24px  /* Modals */
--radius-full: 9999px /* Circular */
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

### Glassmorphism Effect

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

---

## 🧩 Component Library

### Buttons

**Primary Button:**
```css
background: linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%);
color: white;
padding: 12px 24px;
border-radius: 12px;
font-weight: 600;
```

**Secondary Button:**
```css
background: transparent;
border: 2px solid #6B46C1;
color: #6B46C1;
padding: 12px 24px;
border-radius: 12px;
font-weight: 600;
```

### Input Fields

```css
border: 1px solid #E5E7EB;
border-radius: 12px;
padding: 12px 16px;
font-size: 16px;
transition: border-color 0.2s;

&:focus {
  border-color: #6B46C1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
}
```

### Cards

**Post Card:**
```css
background: glassmorphism;
border-radius: 16px;
padding: 16px;
margin-bottom: 16px;
```

**Interest Card:**
```css
background: gradient per interest;
border-radius: 12px;
padding: 16px;
display: flex;
align-items: center;
justify-content: center;
aspect-ratio: 1;
```

### Tags/Pills

```css
background: vivid color (per interest);
color: white;
padding: 6px 12px;
border-radius: 16px;
font-size: 12px;
font-weight: 600;
display: inline-block;
```

### Navigation Bar

```css
position: fixed;
bottom: 0;
width: 100%;
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(10px);
padding: 12px 0;
border-top: 1px solid #E5E7EB;
display: flex;
justify-content: space-around;
```

---

## 📐 Layout Guidelines

### Mobile-First Breakpoints

```css
/* Mobile (default) */
@media (min-width: 375px)

/* Tablet */
@media (min-width: 768px)

/* Desktop */
@media (min-width: 1024px)

/* Large Desktop */
@media (min-width: 1440px)
```

### Content Width

```css
--max-content-width: 640px; /* Mobile */
--max-content-width: 768px; /* Tablet */
--max-content-width: 1024px; /* Desktop */
```

### Safe Areas

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

---

## 🎭 Interaction Patterns

### Micro-Animations

**Button Tap:**
```css
transform: scale(0.95);
transition: transform 0.1s;
```

**Card Hover:**
```css
transform: translateY(-4px);
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
transition: all 0.3s ease;
```

**Like Animation:**
```css
@keyframes like {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

### Loading States

**Skeleton Screens:**
- Use shimmer effect for content loading
- Match layout of actual content
- Gradient animation from left to right

**Spinners:**
- Use for button loading states
- Small (16px) for inline
- Medium (32px) for page loading

### Toast Notifications

```css
position: fixed;
top: 72px;
left: 50%;
transform: translateX(-50%);
background: white;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
border-radius: 12px;
padding: 12px 16px;
animation: slideDown 0.3s ease;
```

---

## 🌗 Dark Mode (Future)

**Color Adjustments:**
```css
/* Dark mode overrides */
--bg-primary: #111827;
--bg-secondary: #1F2937;
--text-primary: #F9FAFB;
--text-secondary: #9CA3AF;
--border: #374151;
```

**Implementation:**
- Use CSS variables for all colors
- Toggle via `data-theme="dark"` attribute
- Persist preference in localStorage
- Auto-detect system preference

---

## 📱 Missing Screens (To Be Designed)

Due to quota limits, these screens still need design:

1. **Create Post** - Composition interface with media upload
2. **Relationships/Friends** - Trust flow UI, friend requests
3. **Events** - Local event discovery and creation
4. **Marketplace** - Local classifieds and listings
5. **Post Detail** - Full post view with comments
6. **Settings** - Account settings, privacy, notifications
7. **Notifications** - Activity feed
8. **Search** - Find users, posts, events, listings

---

## 🚀 Implementation Roadmap

### Phase 1: Core UI (Week 1-2)
- [ ] Set up React + Vite + TypeScript
- [ ] Implement design system (colors, typography, spacing)
- [ ] Create component library (Button, Input, Card, etc.)
- [ ] Build authentication screens (Landing, Signup, Login)
- [ ] Build onboarding (Interests, Radius)
- [ ] Integrate with Week 1 backend APIs

### Phase 2: Feed & Posts (Week 3)
- [ ] Build feed screen with infinite scroll
- [ ] Create post card component
- [ ] Implement create post interface
- [ ] Add like/comment functionality
- [ ] Integrate with Week 2 backend APIs

### Phase 3: Social Features (Week 4-5)
- [ ] Build profile screen
- [ ] Implement relationship/friend system UI
- [ ] Add trust flow indicators
- [ ] Build notification system

### Phase 4: Events & Marketplace (Week 6)
- [ ] Events discovery and creation
- [ ] Marketplace listings
- [ ] Map integration (Google Maps)

### Phase 5: Polish (Week 7)
- [ ] Animations and micro-interactions
- [ ] Error states and empty states
- [ ] Loading states and skeletons
- [ ] Accessibility improvements
- [ ] Performance optimization

---

## 🎯 Key Design Decisions

### 1. Alias-First Identity
- **Why**: Privacy and trust-building
- **How**: @username always prominent, real name gated
- **Visual**: Lock icon indicates restricted visibility

### 2. Location Awareness
- **Why**: Core feature differentiation
- **How**: Distance shown on every post/user/event
- **Visual**: Green location badges, radius selectors

### 3. Interest-Driven Discovery
- **Why**: Improves content relevance
- **How**: Visual tags, multi-select onboarding
- **Visual**: Colorful pills with consistent color per interest

### 4. Vibrant, Modern Aesthetic
- **Why**: Appeal to younger, tech-savvy users
- **How**: Gradients, glassmorphism, bold colors
- **Visual**: Purple-blue brand gradient throughout

### 5. Trust Indicators
- **Why**: Enable safe relationship building
- **How**: Progressive disclosure of identity
- **Visual**: Badges, checkmarks, lock icons

---

## 📚 Resources

**Fonts:**
- Inter: https://fonts.google.com/specimen/Inter

**Icons:**
- Heroicons: https://heroicons.com/
- Lucide: https://lucide.dev/

**Illustrations:**
- unDraw: https://undraw.co/
- Humaaans: https://humaaans.com/

**Colors:**
- Coolors: https://coolors.co/
- Material Design Colors: https://m2.material.io/design/color/

**Components:**
- Headless UI: https://headlessui.com/
- Radix UI: https://radix-ui.com/

---

**Next Steps:** Review these designs, provide feedback, and I can proceed with building the React frontend! 🚀
