/**
 * Soul Wizard — Dimension Specification
 *
 * Defines all 9 signal layers × ~20 attributes each, with their
 * UI types, encoding algorithms, and option lists.
 */

export interface WizardDimension {
    dimId: number;
    name: string;
    label: string;
    encoding: "continuous" | "discrete" | "time-series" | "media" | "narrative" | "vector" | "indexing";
    uiType: "slider" | "single-select" | "multi-select" | "ranked-list";
    options?: string[];
    maxValue?: number;
    levels?: number;
    description?: string;
}

export interface WizardLayer {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    quadrant: "P" | "D" | "M" | "S";
    dimensions: WizardDimension[];
}

export const SOUL_LAYERS: WizardLayer[] = [
    {
        id: "sport",
        title: "Sport",
        subtitle: "Physical activity & competitive drive",
        icon: "🏃",
        quadrant: "P",
        dimensions: [
            { dimId: 1, name: "Sport_Frequency", label: "Exercise Frequency", encoding: "continuous", uiType: "slider", maxValue: 100, description: "How often do you exercise?" },
            { dimId: 2, name: "Sport_Duration", label: "Session Duration", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 3, name: "Sport_Type", label: "Sport Types", encoding: "narrative", uiType: "multi-select", options: ["Running", "Cycling", "Swimming", "Strength", "Yoga", "Team Sports", "Combat", "Racquet"] },
            { dimId: 4, name: "Sport_Intensity", label: "Intensity Level", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 5, name: "Sport_Brand", label: "Favorite Brands", encoding: "indexing", uiType: "multi-select", options: ["Nike", "Adidas", "Under Armour", "Lululemon", "ASICS", "On", "Hoka", "Reebok"] },
            { dimId: 6, name: "Sport_Social", label: "Social Preference", encoding: "discrete", uiType: "single-select", options: ["Solo", "Small Group", "Team", "Both", "Varies"], levels: 5 },
            { dimId: 7, name: "Sport_Environment", label: "Preferred Environment", encoding: "discrete", uiType: "single-select", options: ["Indoor", "Outdoor", "Gym", "Home", "Mixed"], levels: 5 },
            { dimId: 8, name: "Sport_Goal", label: "Fitness Goals", encoding: "narrative", uiType: "multi-select", options: ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "Competition", "Mental Health", "Social", "Fun"] },
            { dimId: 9, name: "Sport_Equipment_Budget", label: "Monthly Equipment Budget", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 10, name: "Sport_Habit_Trend", label: "Activity Trend", encoding: "discrete", uiType: "single-select", options: ["Increasing", "Stable", "Decreasing", "Just Started", "Returning"], levels: 5 },
        ],
    },
    {
        id: "music",
        title: "Music",
        subtitle: "Listening habits & musical taste",
        icon: "🎵",
        quadrant: "D",
        dimensions: [
            { dimId: 21, name: "Music_Genre", label: "Favorite Genres", encoding: "narrative", uiType: "multi-select", options: ["Pop", "Rock", "Hip-Hop", "Electronic", "Classical", "Jazz", "R&B", "Indie"] },
            { dimId: 22, name: "Music_Listening_Freq", label: "Listening Frequency", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 23, name: "Music_Platform", label: "Streaming Platform", encoding: "indexing", uiType: "multi-select", options: ["Spotify", "Apple Music", "YouTube Music", "Tidal", "SoundCloud", "Bandcamp", "Other"] },
            { dimId: 24, name: "Music_Live_Event", label: "Live Event Attendance", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 25, name: "Music_Instrument", label: "Instruments Played", encoding: "narrative", uiType: "multi-select", options: ["Guitar", "Piano", "Drums", "Bass", "Vocals", "DJ", "Production", "None"] },
            { dimId: 26, name: "Music_Mood_Profile", label: "Mood Preference", encoding: "discrete", uiType: "single-select", options: ["Energetic", "Chill", "Emotional", "Dark", "Uplifting"], levels: 5 },
            { dimId: 27, name: "Music_Spending", label: "Monthly Music Spending", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 28, name: "Music_Discovery", label: "Discovery Method", encoding: "discrete", uiType: "single-select", options: ["Algorithm", "Friends", "Critics", "Self-explore", "Radio"], levels: 5 },
        ],
    },
    {
        id: "art",
        title: "Art & Design",
        subtitle: "Aesthetic sensibility & creative expression",
        icon: "🎨",
        quadrant: "M",
        dimensions: [
            { dimId: 41, name: "Art_Style", label: "Preferred Styles", encoding: "narrative", uiType: "multi-select", options: ["Contemporary", "Minimalist", "Abstract", "Realist", "Street Art", "Digital", "Traditional", "Mixed Media"] },
            { dimId: 42, name: "Art_Medium", label: "Favorite Mediums", encoding: "narrative", uiType: "multi-select", options: ["Painting", "Photography", "Sculpture", "Digital Art", "NFT", "Film", "Installation", "Print"] },
            { dimId: 43, name: "Art_Frequency", label: "Gallery/Museum Visits", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 44, name: "Art_Spending", label: "Art Spending", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 45, name: "Art_Digital_NFT", label: "NFT Interest", encoding: "discrete", uiType: "single-select", options: ["Collector", "Creator", "Observer", "Not Interested", "Curious"], levels: 5 },
            { dimId: 46, name: "Art_Creation", label: "Creator vs Consumer", encoding: "continuous", uiType: "slider", maxValue: 100, description: "0 = Pure consumer, 100 = Active creator" },
        ],
    },
    {
        id: "food",
        title: "Food & Dining",
        subtitle: "Culinary preferences & dining habits",
        icon: "🍕",
        quadrant: "P",
        dimensions: [
            { dimId: 61, name: "Food_Diet_Type", label: "Diet Type", encoding: "discrete", uiType: "single-select", options: ["Omnivore", "Vegetarian", "Vegan", "Keto", "Flexitarian", "Other"], levels: 6 },
            { dimId: 62, name: "Food_Cuisine", label: "Favorite Cuisines", encoding: "narrative", uiType: "multi-select", options: ["Italian", "Japanese", "Chinese", "Mexican", "Indian", "French", "Korean", "Thai"] },
            { dimId: 63, name: "Food_Cooking_Freq", label: "Cooking Frequency", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 64, name: "Food_Dining_Budget", label: "Monthly Dining Budget", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 65, name: "Food_Organic_Pref", label: "Organic Preference", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 66, name: "Food_Delivery_Freq", label: "Delivery Frequency", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 67, name: "Food_Brand_Loyalty", label: "Favorite Food Brands", encoding: "indexing", uiType: "multi-select", options: ["Whole Foods", "Trader Joe's", "Starbucks", "Uber Eats", "DoorDash", "HelloFresh", "Local Markets"] },
        ],
    },
    {
        id: "travel",
        title: "Travel",
        subtitle: "Exploration style & destination preferences",
        icon: "✈️",
        quadrant: "P",
        dimensions: [
            { dimId: 81, name: "Travel_Frequency", label: "Travel Frequency", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 82, name: "Travel_Budget", label: "Travel Budget Level", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 83, name: "Travel_Style", label: "Travel Style", encoding: "discrete", uiType: "single-select", options: ["Budget", "Mid-range", "Luxury", "Adventure", "Business"], levels: 5 },
            { dimId: 84, name: "Travel_Destination", label: "Destination Types", encoding: "narrative", uiType: "multi-select", options: ["Beach", "Mountain", "City", "Cultural", "Adventure", "Resort", "Backpacking", "Road Trip"] },
            { dimId: 85, name: "Travel_Booking", label: "Booking Platform", encoding: "indexing", uiType: "multi-select", options: ["Booking.com", "Airbnb", "Expedia", "Direct", "Travel Agent", "Google Travel"] },
            { dimId: 86, name: "Travel_Companion", label: "Travel Companion", encoding: "discrete", uiType: "single-select", options: ["Solo", "Couple", "Family", "Friends", "Group Tour"], levels: 5 },
        ],
    },
    {
        id: "tech",
        title: "Technology",
        subtitle: "Digital literacy & platform preferences",
        icon: "💻",
        quadrant: "D",
        dimensions: [
            { dimId: 101, name: "Tech_Device", label: "Device Ecosystem", encoding: "indexing", uiType: "multi-select", options: ["Apple", "Android", "Windows", "Linux", "Multi-platform"] },
            { dimId: 102, name: "Tech_Adoption", label: "Adoption Speed", encoding: "discrete", uiType: "single-select", options: ["Early Adopter", "Early Majority", "Late Majority", "Laggard", "Innovator"], levels: 5 },
            { dimId: 103, name: "Tech_Crypto", label: "Crypto Literacy", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 104, name: "Tech_DeFi", label: "DeFi Experience", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 105, name: "Tech_Gaming", label: "Gaming Engagement", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 106, name: "Tech_Social", label: "Social Platforms", encoding: "narrative", uiType: "multi-select", options: ["Twitter/X", "Instagram", "TikTok", "Discord", "Reddit", "LinkedIn", "YouTube", "Farcaster"] },
            { dimId: 107, name: "Tech_Privacy", label: "Privacy Concern Level", encoding: "continuous", uiType: "slider", maxValue: 100 },
        ],
    },
    {
        id: "social",
        title: "Social",
        subtitle: "Community engagement & influence",
        icon: "👥",
        quadrant: "S",
        dimensions: [
            { dimId: 121, name: "Social_Extroversion", label: "Extroversion Level", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 122, name: "Social_Influence", label: "Influence Reach", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 123, name: "Social_Platform_Activity", label: "Platform Activity Types", encoding: "narrative", uiType: "multi-select", options: ["Content Creator", "Commenter", "Lurker", "Moderator", "Influencer", "Curator", "Supporter", "Organizer"] },
            { dimId: 124, name: "Social_Community", label: "Community Types", encoding: "narrative", uiType: "multi-select", options: ["Gaming", "Crypto/Web3", "Fitness", "Creative", "Professional", "Activist", "Local", "Academic"] },
            { dimId: 125, name: "Social_Cause", label: "Cause Advocacy", encoding: "narrative", uiType: "multi-select", options: ["Climate", "Education", "Health", "Equality", "Animal Rights", "Technology", "Arts", "None"] },
        ],
    },
    {
        id: "environment",
        title: "Environment",
        subtitle: "Sustainability values & ethical consumption",
        icon: "🌿",
        quadrant: "S",
        dimensions: [
            { dimId: 141, name: "Env_Concern", label: "Environmental Concern", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 142, name: "Env_Ethical", label: "Ethical Consumption", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 143, name: "Env_Carbon", label: "Carbon Awareness", encoding: "discrete", uiType: "single-select", options: ["Very High", "High", "Moderate", "Low", "Not Concerned"], levels: 5 },
            { dimId: 144, name: "Env_Brands", label: "Sustainable Brands", encoding: "indexing", uiType: "multi-select", options: ["Patagonia", "Allbirds", "Tesla", "Beyond Meat", "Oatly", "The Body Shop", "Lush"] },
        ],
    },
    {
        id: "wellness",
        title: "Wellness",
        subtitle: "Mental health & self-care practices",
        icon: "🧘",
        quadrant: "S",
        dimensions: [
            { dimId: 161, name: "Wellness_Meditation", label: "Meditation Frequency", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 162, name: "Wellness_Sleep", label: "Sleep Quality", encoding: "continuous", uiType: "slider", maxValue: 100 },
            { dimId: 163, name: "Wellness_Stress", label: "Stress Level", encoding: "continuous", uiType: "slider", maxValue: 100, description: "0 = Very stressed, 100 = Very calm" },
            { dimId: 164, name: "Wellness_Supplements", label: "Supplement Use", encoding: "narrative", uiType: "multi-select", options: ["Vitamins", "Protein", "CBD", "Adaptogens", "Probiotics", "Omega-3", "Collagen", "None"] },
            { dimId: 165, name: "Wellness_Tracking", label: "Health Tracking", encoding: "discrete", uiType: "single-select", options: ["Comprehensive", "Basic", "Occasional", "Manual", "None"], levels: 5 },
        ],
    },
];
