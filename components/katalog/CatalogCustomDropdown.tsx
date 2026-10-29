"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  id: string;
  label: string;
  count?: number;
  icon?: any;
  group?: string;
}

export interface CatalogCustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  leadIcon: any;
  placeholder?: string;
  colorScheme?: "sky" | "emerald" | "indigo";
}

export function CatalogCustomDropdown({
  value,
  options,
  onChange,
  leadIcon: LeadIcon,
  placeholder = "Pilih opsi",
  colorScheme = "sky",
}: CatalogCustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value) || options[0];
  const isFiltered = value !== "ALL";

  // Group options if groups exist
  const groupedOptions = options.reduce<Record<string, DropdownOption[]>>((acc, opt) => {
    const groupName = opt.group || "Umum";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(opt);
    return acc;
  }, {});

  const groupKeys = Object.keys(groupedOptions);
  const hasMultipleGroups = groupKeys.length > 1;

  const colorClasses = {
    sky: {
      activeBorder: "border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-400",
      activeItem: "bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold",
      iconColor: "text-sky-500",
    },
    emerald: {
      activeBorder: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      activeItem: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold",
      iconColor: "text-emerald-500",
    },
    indigo: {
      activeBorder: "border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      activeItem: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold",
      iconColor: "text-indigo-500",
    },
  }[colorScheme];

  return (
    <div className="relative min-w-[190px] sm:min-w-[220px]" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 pl-3.5 pr-3 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer select-none ${
          isFiltered
            ? `${colorClasses.activeBorder} shadow-xs`
            : "bg-slate-50 dark:bg-white/[0.04] border-slate-200/90 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/20"
        } ${isOpen ? "ring-2 ring-sky-500/20 border-sky-500" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <LeadIcon className={`w-3.5 h-3.5 shrink-0 ${isFiltered ? colorClasses.iconColor : "text-slate-400"}`} />
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {typeof selectedOption?.count === "number" && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 opacity-75 shrink-0">
              {selectedOption.count}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:min-w-[270px] top-full mt-1.5 z-50 bg-white/95 dark:bg-[#111218]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/12 shadow-2xl rounded-2xl p-1.5 max-h-[340px] overflow-y-auto no-scrollbar animate-in fade-in-0 zoom-in-95 duration-150">
          {hasMultipleGroups ? (
            groupKeys.map((group) => (
              <div key={group} className="mb-2 last:mb-0">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {groupedOptions[group].map((opt) => {
                    const isSelected = opt.id === value;
                    const OptIcon = opt.icon;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onChange(opt.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                          isSelected
                            ? colorClasses.activeItem
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          {OptIcon && (
                            <OptIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? colorClasses.iconColor : "text-slate-400"}`} />
                          )}
                          <span className="truncate">{opt.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {typeof opt.count === "number" && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                              {opt.count}
                            </span>
                          )}
                          {isSelected && <Check className={`w-3.5 h-3.5 ${colorClasses.iconColor}`} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.id === value;
                const OptIcon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                      isSelected
                        ? colorClasses.activeItem
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      {OptIcon && (
                        <OptIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? colorClasses.iconColor : "text-slate-400"}`} />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {typeof opt.count === "number" && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                          {opt.count}
                        </span>
                      )}
                      {isSelected && <Check className={`w-3.5 h-3.5 ${colorClasses.iconColor}`} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CatalogCustomDropdown;
