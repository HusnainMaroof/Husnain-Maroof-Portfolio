export interface Project {
  id: string;
  index: string;
  name: string;
  tags: string[];
  year: string;
  accentColor: string;
  discipline: string;
  imageUrl: string; // hero / thumbnail (used in project cards, og:image, etc.)
  images: string[]; // 10 images for the scatter gallery — must have exactly 10 entries
  slug: string;
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
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80",
    slug: "velocity",
    images: [
      // Hero — wide establishing shot
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=80",
      // Supporting — motion / light trails
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558442074-3c19857bc1dc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      // Final featured — full reveal
      "https://images.unsplash.com/photo-1551516594-56cb78394645?auto=format&fit=crop&w=2560&q=80",
    ],
  },

  {
    id: "nocturne",
    index: "02",
    name: "Nocturne",
    tags: ["3D Brand", "Three.js"],
    year: "2024",
    accentColor: "#00AAFF",
    discipline: "Brand & Identity",
    imageUrl:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80",
    slug: "nocturne",
    images: [
      // Hero — dark night sky / deep blue atmosphere
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2560&q=80",
      // Supporting — dark brand / neon / city night
      "https://images.unsplash.com/photo-1493515322954-4fa727e97985?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520034475321-cbe63696469a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=1200&q=80",
      // Final featured
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=2560&q=80",
    ],
  },

  {
    id: "strata",
    index: "03",
    name: "Strata",
    tags: ["Fintech", "Data Viz"],
    year: "2023",
    accentColor: "#FF6B35",
    discipline: "Product Design",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80",
    slug: "strata",
    images: [
      // Hero — clean data / charts / product UI
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2560&q=80",
      // Supporting — fintech / graphs / minimal workspace
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1526628953301-3cd0a4a7d2ca?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1591696331111-ef9586a5b17a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      // Final featured
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=2560&q=80",
    ],
  },

  {
    id: "axiom",
    index: "04",
    name: "Axiom",
    tags: ["E-Commerce", "Animation"],
    year: "2023",
    accentColor: "#B668FF",
    discipline: "Full-Stack",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80",
    slug: "axiom",
    images: [
      // Hero — premium retail / product photography
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2560&q=80",
      // Supporting — e-commerce / lifestyle / product
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1200&q=80",
      // Final featured
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=2560&q=80",
    ],
  },
];
