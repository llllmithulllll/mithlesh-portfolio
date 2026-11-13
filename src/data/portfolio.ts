export type Project = { id: string; name: string; description: string; details: string; tech: string[]; status: string; github?: string; demo?: string; icon: string; accent: string };

// Add or edit projects here. Leave github/demo blank until you have real URLs.
export const projects: Project[] = [
  { id: 'qlora', name: 'Llama 3B QLoRA Fine-Tuning', description: 'A compact language model fine-tuning experiment designed around consumer hardware.', details: 'Explores parameter-efficient fine-tuning with QLoRA and 4-bit quantization. Add your dataset, evaluation notes, and repository link here as the project develops.', tech: ['Python', 'PyTorch', 'Hugging Face', 'QLoRA'], status: 'Experiment', icon: '⌘', accent: '#bb8cf4' },
  { id: 'health-os', name: 'AI Health OS', description: 'An experimental concept for a personal health assistant with AI-powered insights.', details: 'A concept exploring how personal health data could be organized into useful, understandable insights. This is an early concept, not medical advice.', tech: ['AI', 'Product design', 'Health data'], status: 'Concept', icon: '✚', accent: '#5acdbb' },
  { id: 'news-scraper', name: 'News Scraper', description: 'A Python project for collecting and processing news content.', details: 'A practical data collection project. Add source coverage, parsing details, and example outputs as they become available.', tech: ['Python', 'Web scraping', 'Data processing'], status: 'In progress', icon: '▤', accent: '#6db6ff' },
  { id: 'mortality', name: 'Random Forest Mortality Prediction', description: 'A structured-data machine learning exploration using Random Forest models.', details: 'A learning project exploring data preparation and predictive modelling. Add evaluation methodology and dataset context before publishing results.', tech: ['Python', 'Machine Learning', 'Random Forest'], status: 'Learning project', icon: '◈', accent: '#f6a56d' },
  { id: 'games-hub', name: 'Free Games Hub', description: 'A concept for discovering free games in one place.', details: 'A gaming discovery platform concept. Add screenshots, supported platforms, and project links as implementation progresses.', tech: ['Web development', 'Product concept'], status: 'Concept', icon: '◉', accent: '#f5779b' }
];

export const skills = {
  'Programming': ['Python', 'SQL', 'JavaScript'],
  'AI / ML': ['Machine Learning', 'PyTorch', 'Hugging Face', 'LLM Fine-Tuning', 'QLoRA'],
  'Development': ['Git', 'GitHub', 'Linux', 'React', 'APIs']
};

export const profile = {
  name: 'Mithlesh Kumar', role: 'Aspiring AI/ML Engineer · Developer · Technology Enthusiast', location: 'Himachal Pradesh, India', email: '', github: '', linkedin: '', website: '', resumeUrl: '/resume-placeholder.pdf', avatarUrl: '', otherLinks: [] as {label:string;url:string}[],
  intro: 'I’m a BCA graduate and MCA student who enjoys building useful software, experimenting with AI, and solving real-world problems through technology.',
  education: ['Bachelor of Computer Applications (BCA)', 'Master of Computer Applications (MCA) · Ongoing'],
  interests: ['Applied AI and machine learning', 'Useful developer tools', 'Thoughtful product experiences'],
  goals: 'Currently growing my skills in AI/ML and software development through hands-on projects.'
};
