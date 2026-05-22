import React from 'react';

const Card = ({ children, className = '', title, description, footer, ...props }) => {
  return (
    <div 
      className={`premium-card overflow-hidden ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="p-6 pb-0 space-y-1.5">
          {title && <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
