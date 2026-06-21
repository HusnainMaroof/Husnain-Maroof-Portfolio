export interface Project {
  id: string;
  index: string;
  name: string;
  tags: string[];
  year: string;
  accentColor: string;
  discipline: string;
  imageUrl: string;
}

export const PROJECTS: Project[] = [
  {
    id: "velocity",
    index: "01",
    name: "Velocity",
    tags: ["Motion Design", "WebGL"],
    year: "2024",
    accentColor: "#00FF88",
    discipline: "Creative Development",
    imageUrl: "https://picsum.photos/seed/velocity-project/1920/1080",
  },
  {
    id: "nocturne",
    index: "02",
    name: "Nocturne",
    tags: ["3D Brand", "Three.js"],
    year: "2024",
    accentColor: "#00AAFF",
    discipline: "Brand & Identity",
    imageUrl: "https://picsum.photos/seed/nocturne-project/1920/1080",
  },
  {
    id: "strata",
    index: "03",
    name: "Strata",
    tags: ["Fintech", "Data Viz"],
    year: "2023",
    accentColor: "#FF6B35",
    discipline: "Product Design",
    imageUrl: "https://picsum.photos/seed/strata-project/1920/1080",
  },
  {
    id: "axiom",
    index: "04",
    name: "Axiom",
    tags: ["E-Commerce", "Animation"],
    year: "2023",
    accentColor: "#B668FF",
    discipline: "Full-Stack",
    imageUrl: "https://picsum.photos/seed/axiom-project/1920/1080",
  },
];