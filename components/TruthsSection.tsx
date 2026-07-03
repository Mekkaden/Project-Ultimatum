"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["900"] });

const TRUTHS = [
  {
    id: 1,
    title: "Social Media Physiques <span class='text-neutral-500'>Lie</span>",
    body: "Most of what you see online is a heavily fabricated illusion. You are measuring your reality against a highlight reel of strategic lighting, post-workout pumps, calculated angles, and undeclared pharmaceutical assistance masquerading as 'TRT'. Use these influencers as inspiration if you must, but never use them as the benchmark for your own natural progress.",
    image: "/2.webp",
    objectPosition: "center 20%",
  },
  {
    id: 2,
    title: "The Reality Of <span class='text-neutral-500'>Diminishing Returns</span>",
    body: "Hypertrophy is a game of diminishing returns. The vast majority of your natural potential is unlocked in the beginning. An optimized protocol can yield 50% of your lifetime gains in the first year, pushing to 85-90% by year five. Beyond that, fighting for a single pound of tissue annually is normal. It isn't a plateau; it's simply the biological reality of advanced training.",
    image: "/4.jpg",
    objectPosition: "center 60%",
  },
  {
    id: 3,
    title: "The Natural <span class='text-neutral-500'>Dichotomy</span>",
    body: "As a natural lifter, you cannot simultaneously possess massive muscular size and shredded conditioning. You must choose your sacrifice. Alternatively, you can hover in the athletic sweet spot (12-15% body fat) where you maintain respectable size, visible definition, and your overall sanity year-round.",
    image: "/3.jpg",
    objectPosition: "center 20%",
  },
  {
    id: 4,
    title: "Your DNA <span class='text-neutral-500'>Is The Blueprint</span>",
    body: "Your DNA dictates the rules of engagement. It determines your rate of muscle accretion, your maximum muscular potential, how well you handle body fat, and the architectural look of your frame—from muscle insertions to bone structure. However, let's be clear: a relentless work ethic paired with intelligent programming can forge an elite physique on almost anyone.",
    image: "/1.webp",
    objectPosition: "center 30%",
  },
  {
    id: 5,
    title: "The Perpetual <span class='text-neutral-500'>Hunger</span>",
    body: "Perpetual dissatisfaction is part of the territory. The hedonic treadmill guarantees that the moment you hit a goal, your baseline shifts and you immediately crave more. Acknowledge this psychological trap. Keep pushing for greatness, but learn to detach and occasionally look back to appreciate the incredible distance you've already covered.",
    image: "/5.jpg",
    objectPosition: "center 30%",
  }
];

export default function TruthsSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Map the scroll progress to an x translation
  // We have 5 cards. To scroll them all horizontally, we shift the container
  // to the left. 
  // e.g. -80% if there are 5 cards taking 20% width each, 
  // but we can adjust based on the viewport width and card widths.
  // Using a simpler approach: a flex container where we translate X.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        {/* Horizontal scroll container */}
        <motion.div style={{ x }} className="flex pl-8 md:pl-24 gap-8 md:gap-16 items-center h-full w-[600vw] lg:w-[450vw]">
          
          {/* Title as the first item in the scroll */}
          <div className="flex-shrink-0 w-[85vw] md:w-[40vw] flex flex-col justify-center">
            <motion.h2 
              className={`text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500 leading-[0.9] pb-4 ${montserrat.className}`}
              animate={{ 
                filter: ["drop-shadow(0px 0px 10px rgba(255,255,255,0.1))", "drop-shadow(0px 0px 30px rgba(255,255,255,0.5))", "drop-shadow(0px 0px 10px rgba(255,255,255,0.1))"] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              Harsh<br/>Truths
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.5 }}
              className="mt-6 text-white text-sm md:text-base leading-relaxed font-medium max-w-md pr-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]"
            >
              You must read and understand this to remove unrealistic expectations and to understand the practical guidelines.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 2 }}
              className="mt-8 flex items-center gap-4 text-neutral-500 font-mono text-xs md:text-sm tracking-widest uppercase"
            >
              <span>Scroll to uncover</span>
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.div>
            </motion.div>
          </div>
          {TRUTHS.map((truth) => (
            <div key={truth.id} className="flex-shrink-0 w-[85vw] md:w-[400px] lg:w-[480px] flex flex-col justify-center">
              <CardContainer className="inter-var w-full">
                <CardBody className="bg-neutral-900/40 backdrop-blur-md relative group/card hover:shadow-2xl hover:shadow-white/[0.05] border-white/5 w-full h-auto rounded-2xl p-6 md:p-8 border">
                  
                  {/* Premium accent line */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-neutral-400 to-transparent opacity-30 group-hover/card:opacity-100 transition-opacity rounded-t-2xl"></div>

                  <CardItem
                    translateZ="50"
                    className="text-xl md:text-2xl font-bold text-white mb-4 uppercase tracking-wider"
                    dangerouslySetInnerHTML={{ __html: truth.title }}
                  />
                  
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-400 text-sm leading-relaxed mb-6"
                  >
                    {truth.body}
                  </CardItem>

                  <CardItem translateZ="100" className="w-full">
                    <div className="w-full aspect-square bg-neutral-950 rounded-xl overflow-hidden relative flex items-center justify-center border border-white/5">
                      <img src={truth.image} style={{ objectPosition: truth.objectPosition || "center 30%" }} className="h-full w-full object-cover grayscale opacity-70 group-hover/card:opacity-100 group-hover/card:grayscale-0 transition-all duration-500" alt="Card Image" />
                    </div>
                  </CardItem>

                  <div className="absolute -bottom-6 -right-6 text-[8rem] font-black text-white/[0.02] select-none pointer-events-none">
                    0{truth.id}
                  </div>
                </CardBody>
              </CardContainer>
            </div>
          ))}
          {/* Add a spacer at the end to allow the last card to reach the middle of the screen */}
          <div className="w-[10vw] flex-shrink-0"></div>
        </motion.div>
      </div>
    </section>
  );
}
