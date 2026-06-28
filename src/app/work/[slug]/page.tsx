import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROJECTS } from "@/src/data/Projects.data";
import ProjectDetail from "@/src/components/work/ProjectDatail";
import { Navbar } from "@/src/components/ui/NavBar";

// ─────────────────────────────────────────────────────────────────────────────
// Static param generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return PROJECTS.map((p) => ({
    slug: p.slug.replace(/^work\//, ""),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic metadata — params is a Promise in Next.js 15
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find(
    (p) => p.slug === `work/${slug}` || p.id === slug,
  );

  if (!project) return { title: "Not Found" };

  return {
    title: `${project.name} — Work`,
    description: `${project.discipline} · ${project.year}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page — async server component, await params before touching .slug
// ─────────────────────────────────────────────────────────────────────────────

export default async function WorkSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = PROJECTS.find(
    (p) => p.slug === `work/${slug}` || p.id === slug,
  );

  if (!project) notFound();

  return (
    <>
      <div className="bg-white!">
        <Navbar isVisible={true} />
        <ProjectDetail project={project} />
      </div>
    </>
  );
}
