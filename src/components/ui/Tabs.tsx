interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export const Tabs = ({ items, activeId, onChange }: TabsProps) => {
  return (
    <div className="flex rounded-full border border-slate-800 bg-slate-900/60 p-1 text-sm text-slate-300">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={
              'flex-1 rounded-full px-4 py-2 transition ' +
              (isActive
                ? 'bg-ember-500 text-white shadow-card'
                : 'text-slate-400 hover:text-slate-200')
            }
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
