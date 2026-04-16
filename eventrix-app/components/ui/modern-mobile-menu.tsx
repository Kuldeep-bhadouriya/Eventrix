'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, Calendar, Home, Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  href?: string;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  className?: string;
  activeIndex?: number;
  onItemClick?: (item: InteractiveMenuItem, index: number) => void;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: 'home', icon: Home },
  { label: 'strategy', icon: Briefcase },
  { label: 'period', icon: Calendar },
  { label: 'security', icon: Shield },
  { label: 'settings', icon: Settings },
];

const defaultAccentColor = '#ffffff';

function getClampedIndex(index: number, length: number): number {
  if (length === 0) return 0;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor,
  className,
  activeIndex,
  onItemClick,
}) => {
  const finalItems = useMemo(() => {
    const isValid =
      items && Array.isArray(items) && items.length >= 2 && items.length <= 5;

    if (!isValid) {
      console.warn(
        "InteractiveMenu: 'items' prop is invalid or missing. Using default items.",
        items
      );
      return defaultItems;
    }

    return items;
  }, [items]);

  const controlledActiveIndex = useMemo(() => {
    if (typeof activeIndex !== 'number') {
      return undefined;
    }
    return getClampedIndex(activeIndex, finalItems.length);
  }, [activeIndex, finalItems.length]);

  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const fallbackActiveIndex = useMemo(
    () => getClampedIndex(internalActiveIndex, finalItems.length),
    [internalActiveIndex, finalItems.length]
  );
  const resolvedActiveIndex = controlledActiveIndex ?? fallbackActiveIndex;

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[resolvedActiveIndex];
      const activeTextElement = textRefs.current[resolvedActiveIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();

    window.addEventListener('resize', setLineWidth);
    return () => {
      window.removeEventListener('resize', setLineWidth);
    };
  }, [resolvedActiveIndex, finalItems]);

  const handleItemClick = (index: number) => {
    if (controlledActiveIndex === undefined) {
      setInternalActiveIndex(index);
    }
    onItemClick?.(finalItems[index], index);
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { '--component-active-color': activeColor } as React.CSSProperties;
  }, [accentColor]);

  return (
    <nav
      className={cn('menu', className)}
      role='navigation'
      style={navStyle}
      aria-label='Mobile bottom navigation'
    >
      {finalItems.map((item, index) => {
        const isActive = index === resolvedActiveIndex;
        const IconComponent = item.icon;

        return (
          <button
            type='button'
            key={item.label}
            className={`menu__item ${isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(index)}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            style={{ '--lineWidth': '0px' } as React.CSSProperties}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className='menu__icon'>
              <IconComponent className='icon' />
            </div>
            <strong
              className={`menu__text ${isActive ? 'active' : ''}`}
              ref={(el) => {
                textRefs.current[index] = el;
              }}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
};

export { InteractiveMenu };
