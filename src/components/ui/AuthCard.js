import React from 'react';
import Link from 'next/link';

export default function AuthCard({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Platform Branding Header */}
      <div className="text-center mb-8 animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20 transform group-hover:rotate-12 transition-transform duration-300">
            D
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            delicious
          </span>
        </Link>
      </div>

      {/* Main Form Card Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/70 border border-slate-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>

        {/* Footer Navigation Link */}
        {footerText && footerLinkText && footerLinkHref && (
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 text-center text-sm text-slate-600">
            {footerText}{' '}
            <Link 
              href={footerLinkHref} 
              className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
            >
              {footerLinkText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
