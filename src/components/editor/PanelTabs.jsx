export default function PanelTabs({ tabs, onRestore }) {
  return (
    <div className="fixed bottom-0 left-72 right-0 h-10
    backdrop-blur-xl bg-black/70 border-t border-white/10
    flex items-center gap-2 px-3 z-40">

      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onRestore(tab)}
          className="px-4 py-1 rounded-md bg-purple-600/30 hover:bg-purple-600/50 text-sm"
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
}
