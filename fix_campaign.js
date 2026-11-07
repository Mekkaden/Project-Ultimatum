const fs = require('fs');

let content = fs.readFileSync('app/campaign/page.tsx', 'utf8');

// 1. Add state variables
if (!content.includes('const [hasCardio, setHasCardio]')) {
  content = content.replace(
    'const [flexTier, setFlexTier] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");',
    'const [flexTier, setFlexTier] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");\n  const [hasCardio, setHasCardio] = useState(false);\n  const [hasFlex, setHasFlex] = useState(false);'
  );
}

// 2. Set them in the first useEffect
if (!content.includes('setHasCardio(!!localStorage.getItem("ultimatum_cardio_split"));')) {
  content = content.replace(
    'const savedFreq = localStorage.getItem("ultimatum_frequency");',
    'const savedFreq = localStorage.getItem("ultimatum_frequency");\n    setHasCardio(!!localStorage.getItem("ultimatum_cardio_split"));\n    setHasFlex(!!localStorage.getItem("ultimatum_flex_tier"));'
  );
}

// 3. Define the EmptyState UI
const emptyStateJSX = `
const EmptyProtocolState = ({ title, description }: { title: string, description: string }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
      <Lock className="text-neutral-500" size={24} />
    </div>
    <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">{title}</h3>
    <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
      {description}
    </p>
    <button 
      onClick={() => router.push("/setup-mode")}
      className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform"
    >
      Configure Protocol
    </button>
  </div>
);
`;

if (!content.includes('const EmptyProtocolState')) {
  // Put it before the return
  content = content.replace(
    '  if (isLoadingDB) {',
    emptyStateJSX + '\n  if (isLoadingDB) {'
  );
}

// 4. Update the render blocks
if (content.includes('        ) : routineMode === "cardio" ? (')) {
  content = content.replace(
    /        \) : routineMode === "cardio" \? \(\n          <CardioTracker \/>\n        \) : \(/,
    `        ) : routineMode === "cardio" ? (
          hasCardio ? <CardioTracker /> : <EmptyProtocolState title="Cardio Inactive" description="You did not configure a cardiovascular protocol during setup. Reconfigure your directive to unlock this." />
        ) : (`
  );
}

if (content.includes('            {routineMode === "flexibility" && (')) {
  content = content.replace(
    /            \{routineMode === "flexibility" && \(\n              <div className="flex justify-center md:justify-start gap-4 mb-6 ml-4 md:ml-8">\n                \{\["BEGINNER", "INTERMEDIATE", "ADVANCED"\]\.map\(\(tier\) => \(\n                  <button[\s\S]*?<\/div>\n            \)}/,
    `            {routineMode === "flexibility" && (
              hasFlex ? (
                <div className="flex justify-center md:justify-start gap-4 mb-6 ml-4 md:ml-8">
                  {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => {
                        setFlexTier(tier as any);
                        localStorage.setItem("ultimatum_flex_tier", tier);
                      }}
                      className={\`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 \${
                        flexTier === tier
                          ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                          : "bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white"
                      }\`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyProtocolState title="Flexibility Inactive" description="You did not configure a flexibility protocol during setup. Reconfigure your directive to unlock this." />
              )
            )}`
  );
}

// We also need to conditionally render The Campaign Timeline because if it's flexibility and !hasFlex, we shouldn't show it.
// The timeline map uses displayCampaign.days.map
if (content.includes('{displayCampaign.days.map((day, index) => {')) {
  content = content.replace(
    '{displayCampaign.days.map((day, index) => {',
    '{((routineMode === "flexibility" && !hasFlex) ? [] : displayCampaign.days).map((day, index) => {'
  );
}


fs.writeFileSync('app/campaign/page.tsx', content);
console.log("Updated app/campaign/page.tsx");
