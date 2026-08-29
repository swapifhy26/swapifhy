import React from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Download, Mail, Globe, Newspaper } from "lucide-react";
import { motion } from "framer-motion";

export default function PressKit() {
  const pressReleases = [
    {
      date: "August 29, 2026",
      title: "Swapifhy Launches Beta Version of Skill-Swapping Platform",
      summary: "Swapifhy officially enters its invite-only beta phase, bringing a revolutionary way to learn directly from people instead of just pre-recorded videos."
    },
    {
      date: "July 15, 2026",
      title: "Swapifhy Introduces Advanced Community Filtering",
      summary: "New features allow users to find highly targeted skill-swapping partners based on reputation, location, and specific learning goals."
    },
    {
      date: "June 1, 2026",
      title: "Swapifhy Reaches 1,000 Early Access Waitlist Signups",
      summary: "The platform sees unprecedented growth as students and professionals eagerly await the public launch of the skill-sharing ecosystem."
    },
    {
      date: "May 10, 2026",
      title: "Founding Team Announces Swapifhy at Tech Innovators Summit",
      summary: "Swapifhy's core mission to democratize education through peer-to-peer learning was unveiled, receiving strong praise from industry leaders."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-background font-sans relative overflow-hidden text-foreground">
      <Head>
        <title>Press Kit - Swapifhy</title>
      </Head>

      {/* Ambient Animated Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/20 blur-[120px] rounded-full opacity-50 animate-pulse pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full opacity-40 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 p-6 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <ArrowLeft size={20} className="text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Back to Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <img src="/images/features/swapifhy-logo-DPxPDdg-.png" alt="Swapifhy Logo" className="w-8 h-8 rounded-md bg-white p-1" />
          <span className="font-heading font-semibold text-lg tracking-wide">Swapifhy</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 pb-24 space-y-16">
        
        {/* HERO SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
            Official Press Kit
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
            Swapifhy Media Resources
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to write about Swapifhy. Learn about our mission to democratize education through peer-to-peer skill swapping.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ABOUT BOILERPLATE */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-surface/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-heading font-semibold mb-6 flex items-center gap-3">
              <Globe className="text-primary" /> About Swapifhy
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong>Short Description:</strong> Swapifhy is a community-driven learning platform where individuals trade skills directly with one another, moving beyond traditional pre-recorded courses into live, interactive, peer-to-peer education.
              </p>
              <p>
                <strong>Boilerplate:</strong> Founded with the vision of making high-quality education accessible and reciprocal, Swapifhy connects passionate learners and experts worldwide. Whether you want to learn coding in exchange for teaching Spanish, or trade design skills for marketing advice, Swapifhy provides the tools, scheduling, and community to make it happen. Our mission is simple: Learn from people. Not just videos.
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border/50 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-foreground bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Mail size={16} className="text-muted-foreground" /> swapifhy.official@gmail.com
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <Globe size={16} className="text-muted-foreground" /> www.swapifhy.com
              </div>
            </div>
          </motion.section>

          {/* BRAND ASSETS */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary/5 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 flex flex-col justify-between shadow-2xl"
          >
            <div>
              <h2 className="text-2xl font-heading font-semibold mb-6 text-primary">Brand Assets</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Download official logos, app icons, and brand guidelines for your publications.
              </p>
              
              <div className="bg-white rounded-xl p-6 flex items-center justify-center mb-6 shadow-inner">
                <img src="/images/features/swapifhy-logo-DPxPDdg-.png" alt="Swapifhy Official Logo" className="w-24 h-24 object-contain drop-shadow-md" />
              </div>
            </div>
            
            <a href="/images/features/swapifhy-logo-DPxPDdg-.png" download className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition shadow-lg shadow-primary/25">
              <Download size={18} /> Download Logo
            </a>
          </motion.section>

        </div>

        {/* RECENT PRESS RELEASES */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-10 shadow-2xl"
        >
          <h2 className="text-2xl font-heading font-semibold mb-8 flex items-center gap-3">
            <Newspaper className="text-primary" /> Latest Press & News
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pressReleases.map((press, index) => (
              <div key={index} className="group p-6 rounded-2xl bg-background/50 border border-white/5 hover:border-primary/30 transition duration-300 hover:bg-white/5">
                <div className="text-xs font-mono text-primary/80 mb-3">{press.date}</div>
                <h3 className="text-lg font-semibold text-foreground mb-3 leading-snug group-hover:text-primary transition">
                  {press.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {press.summary}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* COLORS & TYPOGRAPHY */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="bg-surface/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-heading font-semibold mb-6">Brand Colors</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-16 rounded-xl bg-primary shadow-lg mb-2"></div>
                <span className="text-xs font-mono text-muted-foreground">Primary</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-16 rounded-xl bg-secondary shadow-lg mb-2"></div>
                <span className="text-xs font-mono text-muted-foreground">Secondary</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-16 rounded-xl bg-surface border border-border shadow-lg mb-2"></div>
                <span className="text-xs font-mono text-muted-foreground">Surface</span>
              </div>
            </div>
          </div>

          <div className="bg-surface/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl flex flex-col justify-center">
            <h2 className="text-xl font-heading font-semibold mb-4">Typography</h2>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-heading font-bold text-foreground">Plus Jakarta Sans</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Headings & Display</div>
              </div>
              <div>
                <div className="text-xl font-sans text-foreground">Inter</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Body text & UI elements</div>
              </div>
            </div>
          </div>
        </motion.section>
        
      </main>
    </div>
  );
}
