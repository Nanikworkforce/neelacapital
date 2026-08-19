import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ShortStayPortal from './ShortStayPortal';
import NeelaLogo from './NeelaLogo';

const ShortStaysPublicPage: React.FC = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId?: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30">
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 min-w-0"
            aria-label="Neela Capital home"
          >
            <NeelaLogo variant="full" size="sm" showGlow className="hidden sm:block" />
            <NeelaLogo variant="mark" size="sm" className="sm:hidden" />
          </button>
        </div>
      </header>
      <ShortStayPortal
        onBack={() => navigate('/')}
        initialPropertyId={propertyId}
        onPropertyChange={(id) => {
          if (id) navigate(`/short-stays/${id}`, { replace: true });
          else navigate('/short-stays', { replace: true });
        }}
      />
    </div>
  );
};

export default ShortStaysPublicPage;
