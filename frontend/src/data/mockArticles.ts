export interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  category: string;
  imageUrl?: string;
  content?: string;
}

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Global Climate Summit Reaches Historic Agreement on Carbon Emissions",
    summary: "World leaders have agreed to reduce carbon emissions by 50% within the next decade. The landmark agreement includes binding commitments from major economies and a $200 billion fund for developing nations.",
    source: "Reuters",
    publishedAt: "2024-01-31T08:30:00Z",
    url: "https://example.com/climate-agreement",
    category: "politics",
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=450&fit=crop"
  },
  {
    id: "2",
    title: "Revolutionary AI Breakthrough Promises to Transform Healthcare Diagnostics",
    summary: "Scientists develop an AI system that can detect rare diseases with 99.7% accuracy. The technology could revolutionize early diagnosis and treatment, potentially saving millions of lives worldwide.",
    source: "BBC",
    publishedAt: "2024-01-31T06:15:00Z",
    url: "https://example.com/ai-healthcare",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=450&fit=crop"
  },
  {
    id: "3",
    title: "Major Tech Companies Report Record Q4 Earnings Despite Economic Uncertainty",
    summary: "Leading technology firms exceed analyst expectations with strong quarterly results. Cloud computing and AI investments drive growth while traditional sectors face headwinds from inflation concerns.",
    source: "CNN Business",
    publishedAt: "2024-01-31T05:45:00Z",
    url: "https://example.com/tech-earnings",
    category: "business",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop"
  },
  {
    id: "4",
    title: "Breaking: International Space Station Mission Launches Successfully",
    summary: "NASA and international partners successfully launch crew mission to the ISS. The mission includes groundbreaking experiments in zero gravity manufacturing and sustainable energy research.",
    source: "Associated Press",
    publishedAt: "2024-01-31T04:20:00Z",
    url: "https://example.com/space-mission",
    category: "science",
    imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=450&fit=crop"
  },
  {
    id: "5",
    title: "New Study Reveals Promising Results for Alzheimer's Treatment",
    summary: "Clinical trials show significant improvement in cognitive function for early-stage patients. The innovative treatment approach targets protein buildup in the brain and shows 70% effectiveness rate.",
    source: "The Guardian",
    publishedAt: "2024-01-31T03:10:00Z",
    url: "https://example.com/alzheimers-treatment",
    category: "health",
    imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=450&fit=crop"
  },
  {
    id: "6",
    title: "Olympic Champions Prepare for Upcoming Summer Games with New Training Methods",
    summary: "Athletes embrace cutting-edge technology and data analytics to optimize performance. Virtual reality training and biometric monitoring help competitors gain competitive advantages.",
    source: "ESPN",
    publishedAt: "2024-01-31T02:30:00Z",
    url: "https://example.com/olympic-training",
    category: "sports",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop"
  },
  {
    id: "7",
    title: "Renewable Energy Milestone: Solar Power Reaches Grid Parity Globally",
    summary: "Solar energy costs now match traditional fossil fuels worldwide. This achievement marks a turning point for clean energy adoption and could accelerate the transition to sustainable power sources.",
    source: "Financial Times",
    publishedAt: "2024-01-31T01:45:00Z",
    url: "https://example.com/solar-energy",
    category: "business",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=450&fit=crop"
  },
  {
    id: "8",
    title: "Breakthrough in Quantum Computing Achieves 1000-Qubit Milestone",
    summary: "Researchers demonstrate stable quantum computer with unprecedented processing power. The achievement brings practical quantum applications closer to reality, including cryptography and drug discovery.",
    source: "Nature",
    publishedAt: "2024-01-31T00:20:00Z",
    url: "https://example.com/quantum-computing",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop"
  }
];