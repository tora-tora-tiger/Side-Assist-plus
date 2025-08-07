import React from 'react';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 'md',
  className = '',
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-12',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const classes = `grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`;

  return <div className={classes}>{children}</div>;
};

interface GridItemProps {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  className?: string;
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpan = 1,
  className = '',
}) => {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 lg:col-span-2',
    3: 'col-span-1 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4',
    6: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6',
    12: 'col-span-12',
  };

  const classes = `${spanClasses[colSpan]} ${className}`;

  return <div className={classes}>{children}</div>;
};
