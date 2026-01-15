
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const formattedIndex = index.toString().padStart(2, '0');

  return (
    <div className="group transition-all duration-700">
        <a 
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block space-y-4"
        >
            <div className="relative aspect-cover rounded-2xl overflow-hidden bg-white shadow-[0_4px_24px_-10px_rgba(0,0,0,0.1)] transition-all duration-700 group-hover:shadow-[0_24px_48px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
                <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                <div className="absolute top-4 left-4 font-mono text-[6px] text-white bg-stone-900/30 backdrop-blur-md px-2 py-0.5 rounded tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500 z-30">
                    ID-{formattedIndex}
                </div>
            </div>

            <div className="space-y-2 px-1">
                <span className="font-mono text-[7px] uppercase tracking-[0.4em] text-stone-400">
                    {project.category}
                </span>
                <div className="space-y-1">
                    <h3 className="font-heading font-normal text-[1.2rem] md:text-[1.3rem] text-stone-700 leading-tight transition-all group-hover:text-[#9e2a2a] duration-500 tracking-wide">
                        {project.title}
                    </h3>
                    <p className="font-sans text-[0.8rem] text-stone-400 leading-relaxed line-clamp-2 font-normal opacity-70">
                        {project.description}
                    </p>
                </div>
            </div>
        </a>
    </div>
  );
};

export default ProjectCard;
