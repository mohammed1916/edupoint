/// <reference types="@types/google.maps" />

interface Window {
  google?: {
    accounts?: {
      id: {
        initialize: (options: any) => void;
        renderButton: (container: HTMLElement, options: any) => void;
        prompt: () => void;
      };
    };
  };
}
