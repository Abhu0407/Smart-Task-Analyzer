import { useState } from "react";
import { X, Sparkles } from "lucide-react";

const AVATAR_STYLES = [
  { name: "avataaars", label: "Avataaars" },
  { name: "adventurer", label: "Adventurer" },
  { name: "big-smile", label: "Big Smile" },
  { name: "bottts", label: "Bottts" },
  { name: "fun-emoji", label: "Fun Emoji" },
  { name: "icons", label: "Icons" },
  { name: "identicon", label: "Identicon" },
  { name: "lorelei", label: "Lorelei" },
  { name: "micah", label: "Micah" },
  { name: "miniavs", label: "Miniavs" },
  { name: "open-peeps", label: "Open Peeps" },
  { name: "personas", label: "Personas" },
  { name: "pixel-art", label: "Pixel Art" },
];

const PRESET_SEEDS = [
  "Alice", "Bob", "Charlie", "Diana", "Emma", "Frank", "Grace", "Henry",
  "Ivy", "Jack", "Kate", "Liam", "Mia", "Noah", "Olivia", "Paul",
  "Quinn", "Ruby", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander",
  "Yara", "Zoe", "Alex", "Blake", "Casey", "Drew", "Ellis", "Finley"
];

const AvatarSelector = ({ isOpen, onClose, onSelect }) => {
  const [selectedStyle, setSelectedStyle] = useState("avataaars");
  const [customSeed, setCustomSeed] = useState("");

  const generateAvatarUrl = (style, seed) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  };

  const handleSelect = (seed) => {
    const avatarUrl = generateAvatarUrl(selectedStyle, seed);
    onSelect(avatarUrl);
  };

  const handleCustomSeed = () => {
    if (customSeed.trim()) {
      handleSelect(customSeed.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-base-100 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">Choose Your Avatar</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Selector */}
        <div className="p-6 border-b border-base-300">
          <label className="text-sm font-medium mb-3 block">Avatar Style</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_STYLES.map((style) => (
              <button
                key={style.name}
                onClick={() => setSelectedStyle(style.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStyle === style.name
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 hover:bg-base-300"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Seed Input */}
        <div className="p-6 border-b border-base-300">
          <label className="text-sm font-medium mb-3 block">Custom Avatar</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter any name or word..."
              value={customSeed}
              onChange={(e) => setCustomSeed(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSeed()}
              className="input input-bordered flex-1"
            />
            <button
              onClick={handleCustomSeed}
              disabled={!customSeed.trim()}
              className="btn btn-primary"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <label className="text-sm font-medium mb-3 block">Preset Avatars</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {PRESET_SEEDS.map((seed) => {
              const avatarUrl = generateAvatarUrl(selectedStyle, seed);
              return (
                <button
                  key={seed}
                  onClick={() => handleSelect(seed)}
                  className="group relative aspect-square rounded-full overflow-hidden border-2 border-base-300 hover:border-primary transition-all hover:scale-105"
                >
                  <img
                    src={avatarUrl}
                    alt={seed}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-base-300 flex justify-end">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;

