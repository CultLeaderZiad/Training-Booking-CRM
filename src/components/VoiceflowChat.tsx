import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const VoiceflowChat = () => {
  const { user } = useAuth();

  useEffect(() => {
    const scriptId = 'voiceflow-widget-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const loadVoiceflow = () => {
      if ((window as any).voiceflow?.chat) {
        (window as any).voiceflow.chat.load({
          verify: { projectID: '69b789ec5775917f734a45ac' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          },
          user: user ? {
            name: user.user_metadata?.full_name || user.email,
            email: user.email,
          } : undefined
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
      script.onload = loadVoiceflow;
      document.body.appendChild(script);
    } else {
      loadVoiceflow();
    }
  }, [user]);

  return null;
};

export default VoiceflowChat;
